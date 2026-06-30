import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const root = process.cwd();
const sourceDir = path.resolve(root, 'public', 'assets', 'images', 'cars');
const processedDir = path.resolve(sourceDir, 'processed');
const manifestPath = path.resolve(root, 'src', 'utils', 'processedVehicleImages.ts');

const ALLOW_EXTENSIONS = ['.png'];
const TRANSPARENT_PIXEL_THRESHOLD = 0.02;
const WHITE_SIMILARITY_THRESHOLD = 0.95;
const BACKGROUND_SIMILARITY_THRESHOLD = 40;
const NEAR_WHITE_THRESHOLD = 230;
const ALPHA_TRANSPARENT_THRESHOLD = 250;

const targetFilenames = new Set(process.argv.slice(2).map((value) => String(value).trim()).filter(Boolean));
const isSelectiveRun = targetFilenames.size > 0;
const QUALITY_CHECK_FILES = new Set(['Maruti Ciaz.png', 'Maruti Swift(2018-2023).png']);

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getColorDistance(a, b) {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 +
    (a[1] - b[1]) ** 2 +
    (a[2] - b[2]) ** 2
  );
}

function getColorSaturation(rgb) {
  const [r, g, b] = rgb.map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

function getDominantOpaqueColorInfo(raw, width, height) {
  const bins = new Map();
  const opaqueThreshold = 245;
  let opaqueCount = 0;

  for (let i = 0; i < raw.length; i += 4) {
    const alpha = raw[i + 3];
    if (alpha < opaqueThreshold) continue;
    opaqueCount += 1;
    const key = `${Math.round(raw[i] / 16)}_${Math.round(raw[i + 1] / 16)}_${Math.round(raw[i + 2] / 16)}`;
    bins.set(key, (bins.get(key) || 0) + 1);
  }

  let dominantKey = null;
  let dominantCount = 0;
  for (const [key, count] of bins.entries()) {
    if (count > dominantCount) {
      dominantCount = count;
      dominantKey = key;
    }
  }

  if (!dominantKey || opaqueCount === 0) {
    return { ratio: 0, color: [0, 0, 0], isGray: false };
  }

  const [r, g, b] = dominantKey.split('_').map((value) => Number(value) * 16);
  const saturation = getColorSaturation([r, g, b]);
  return {
    ratio: dominantCount / opaqueCount,
    color: [r, g, b],
    isGray: saturation < 0.18,
  };
}

async function evaluateBackgroundRemovalQuality(buffer) {
  const image = sharp(buffer).ensureAlpha();
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) {
    return 0;
  }

  const { width, height } = metadata;
  const raw = await image.raw().toBuffer();
  const totalPixels = width * height;
  let transparentCount = 0;
  let semiTransparentCount = 0;
  let opaqueBorderCount = 0;
  let borderPixelCount = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const alpha = raw[idx + 3];
      if (alpha < 16) {
        transparentCount += 1;
      } else if (alpha < 245) {
        semiTransparentCount += 1;
      }
      const isBorder = x === 0 || y === 0 || x === width - 1 || y === height - 1;
      if (isBorder) {
        borderPixelCount += 1;
        if (alpha >= 245) {
          opaqueBorderCount += 1;
        }
      }
    }
  }

  const transparentRatio = transparentCount / totalPixels;
  const semiTransparentRatio = semiTransparentCount / totalPixels;
  const opaqueBorderRatio = borderPixelCount > 0 ? opaqueBorderCount / borderPixelCount : 0;
  const dominantInfo = getDominantOpaqueColorInfo(raw, width, height);

  let score = 100;
  score -= clamp((0.35 - transparentRatio) * 120, 0, 40);
  score -= clamp(opaqueBorderRatio * 100, 0, 35);
  score -= clamp(semiTransparentRatio * 200, 0, 20);
  score -= dominantInfo.ratio > 0.45 ? clamp((dominantInfo.ratio - 0.45) * 100, 0, 25) : 0;
  score -= dominantInfo.isGray ? 10 : 0;

  return clamp(Math.round(score), 0, 100);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function isAlreadyTransparent(imagePath) {
  const image = sharp(imagePath).ensureAlpha();
  const metadata = await image.metadata();
  if (!metadata.hasAlpha || !metadata.width || !metadata.height) {
    return false;
  }

  const buffer = await image.raw().toBuffer();
  let transparentPixels = 0;
  const pixelCount = metadata.width * metadata.height;

  for (let i = 3; i < buffer.length; i += 4) {
    if (buffer[i] < ALPHA_TRANSPARENT_THRESHOLD) {
      transparentPixels += 1;
    }
  }

  return transparentPixels / pixelCount >= TRANSPARENT_PIXEL_THRESHOLD;
}

function colorDistance(a, b) {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 +
    (a[1] - b[1]) ** 2 +
    (a[2] - b[2]) ** 2
  );
}

function isWhitePixel(rgb) {
  return rgb[0] >= 240 && rgb[1] >= 240 && rgb[2] >= 240;
}

function isNearWhite(rgb) {
  return rgb[0] >= NEAR_WHITE_THRESHOLD && rgb[1] >= NEAR_WHITE_THRESHOLD && rgb[2] >= NEAR_WHITE_THRESHOLD;
}

function getBorderSamples(raw, width, height) {
  const samples = [];
  const step = Math.max(1, Math.floor(Math.min(width, height) / 20));

  for (let x = 0; x < width; x += step) {
    const topIndex = (0 * width + x) * 4;
    const bottomIndex = ((height - 1) * width + x) * 4;
    samples.push([raw[topIndex], raw[topIndex + 1], raw[topIndex + 2]]);
    samples.push([raw[bottomIndex], raw[bottomIndex + 1], raw[bottomIndex + 2]]);
  }

  for (let y = 0; y < height; y += step) {
    const leftIndex = (y * width + 0) * 4;
    const rightIndex = (y * width + (width - 1)) * 4;
    samples.push([raw[leftIndex], raw[leftIndex + 1], raw[leftIndex + 2]]);
    samples.push([raw[rightIndex], raw[rightIndex + 1], raw[rightIndex + 2]]);
  }

  return samples;
}

function getAverageColor(samples) {
  const avg = [0, 0, 0];
  for (const [r, g, b] of samples) {
    avg[0] += r;
    avg[1] += g;
    avg[2] += b;
  }

  avg[0] /= samples.length;
  avg[1] /= samples.length;
  avg[2] /= samples.length;

  return avg;
}

function shouldRemovePixel(rgb, backgroundColor, backgroundIsWhite) {
  if (backgroundIsWhite) {
    return isNearWhite(rgb) || colorDistance(rgb, backgroundColor) < BACKGROUND_SIMILARITY_THRESHOLD;
  }
  return colorDistance(rgb, backgroundColor) < BACKGROUND_SIMILARITY_THRESHOLD;
}

function createTransparentMask(raw, width, height, backgroundColor, backgroundIsWhite) {
  const mask = new Uint8Array(width * height);
  const queue = [];

  const indexFrom = (x, y) => y * width + x;

  const addIfBackground = (x, y) => {
    const idx = indexFrom(x, y);
    if (mask[idx]) return;
    const pixelBase = idx * 4;
    const rgb = [raw[pixelBase], raw[pixelBase + 1], raw[pixelBase + 2]];
    if (shouldRemovePixel(rgb, backgroundColor, backgroundIsWhite)) {
      mask[idx] = 1;
      queue.push({ x, y });
    }
  };

  for (let x = 0; x < width; x += 1) {
    addIfBackground(x, 0);
    addIfBackground(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    addIfBackground(0, y);
    addIfBackground(width - 1, y);
  }

  while (queue.length > 0) {
    const { x, y } = queue.shift();
    const neighbors = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 },
    ];

    for (const neighbor of neighbors) {
      if (neighbor.x < 0 || neighbor.x >= width || neighbor.y < 0 || neighbor.y >= height) continue;
      const nIdx = indexFrom(neighbor.x, neighbor.y);
      if (mask[nIdx]) continue;
      const pixelBase = nIdx * 4;
      const rgb = [raw[pixelBase], raw[pixelBase + 1], raw[pixelBase + 2]];
      if (shouldRemovePixel(rgb, backgroundColor, backgroundIsWhite)) {
        mask[nIdx] = 1;
        queue.push(neighbor);
      }
    }
  }

  return mask;
}

async function removeBackgroundHeuristic(imageBuffer, filename) {
  const image = sharp(imageBuffer).ensureAlpha();
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error('Invalid image dimensions');
  }

  const { width, height } = metadata;
  const raw = await image.raw().toBuffer();
  const borderSamples = getBorderSamples(raw, width, height);
  const backgroundColor = getAverageColor(borderSamples);
  const backgroundIsWhite = borderSamples.filter((rgb) => isWhitePixel(rgb)).length / borderSamples.length >= WHITE_SIMILARITY_THRESHOLD;
  const mask = createTransparentMask(raw, width, height, backgroundColor, backgroundIsWhite);

  let transparentCount = 0;
  const result = Buffer.from(raw);
  for (let i = 0; i < width * height; i += 1) {
    if (mask[i]) {
      result[i * 4 + 3] = 0;
      transparentCount += 1;
    }
  }

  if (transparentCount > 0) {
    return sharp(result, { raw: { width, height, channels: 4 } }).png();
  }

  const fallback = Buffer.from(raw);
  for (let i = 0; i < raw.length; i += 4) {
    const rgb = [raw[i], raw[i + 1], raw[i + 2]];
    if (shouldRemovePixel(rgb, backgroundColor, backgroundIsWhite)) {
      fallback[i + 3] = 0;
      transparentCount += 1;
    }
  }

  if (transparentCount === 0) {
    throw new Error('Heuristic background removal did not produce any transparency');
  }

  return sharp(fallback, { raw: { width, height, channels: 4 } }).png();
}

async function listProcessedFiles() {
  const entries = await fs.readdir(processedDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && ALLOW_EXTENSIONS.includes(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort();
}

async function processImage(filename) {
  console.log(`Processing ${filename}...`);
  const sourcePath = path.resolve(sourceDir, filename);
  const outputPath = path.resolve(processedDir, filename);
  const tempOutputPath = path.resolve(processedDir, `${filename}.tmp`);
  const qualityCheck = QUALITY_CHECK_FILES.has(filename);
  const existingProcessed = await fileExists(outputPath);

  if (!qualityCheck && existingProcessed) {
    await fs.rm(outputPath, { force: true });
    console.log(`  Deleted existing processed image for ${filename}`);
  }

  if (await isAlreadyTransparent(sourcePath)) {
    if (!qualityCheck && existingProcessed) {
      await fs.rm(outputPath, { force: true });
    }
    await fs.copyFile(sourcePath, outputPath);
    return { filename, status: 'copied transparent original' };
  }

  const sourceBuffer = await fs.readFile(sourcePath);

  try {
    const processedBuffer = await removeBackgroundHeuristic(sourceBuffer, filename).then((processor) => processor.png().toBuffer());
    const processedMeta = await sharp(processedBuffer).metadata();
    if (!processedMeta.hasAlpha) {
      throw new Error('Processed image does not contain an alpha channel');
    }

    let score;
    if (qualityCheck) {
      score = await evaluateBackgroundRemovalQuality(processedBuffer);
      console.log(`${filename}`);
      console.log(`Background Removal Score: ${score}%`);
      if (score <= 90) {
        console.log(`Manual image replacement required: ${filename}`);
        return { filename, status: 'manual replacement recommended', score };
      }
    }

    if (existingProcessed) {
      await fs.rm(outputPath, { force: true });
    }
    await fs.writeFile(tempOutputPath, processedBuffer);
    await fs.rename(tempOutputPath, outputPath);

    if (qualityCheck) {
      console.log('Result:\nAccepted processed image.');
    }

    return { filename, status: 'success', method: 'fallback', score };
  } catch (error) {
    await fs.rm(tempOutputPath, { force: true });
    console.warn(`Background removal failed for ${filename}:`, error.message || error);
    return { filename, status: 'failed' };
  }
}

async function buildManifest(processedFiles) {
  const content = `/* eslint-disable */\n// This file is generated by scripts/processVehicleImages.js\nexport const PROCESSED_VEHICLE_IMAGES = new Set<string>([\n${processedFiles
    .map((name) => `  ${JSON.stringify(name)}`)
    .join(',\n')}\n]);\n`;
  await fs.writeFile(manifestPath, content, 'utf8');
}

async function main() {
  console.log('Running processVehicleImages in', root);
  await ensureDir(processedDir);

  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  const filenames = entries
    .filter((entry) => entry.isFile() && ALLOW_EXTENSIONS.includes(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort();

  const selectedFilenames = isSelectiveRun
    ? filenames.filter((name) => targetFilenames.has(name))
    : filenames;

  if (isSelectiveRun) {
    console.log('Selective regeneration requested for:');
    Array.from(targetFilenames).sort().forEach((name) => console.log(`  - ${name}`));
  }

  const successFiles = [];
  const failedFiles = [];

  for (const filename of selectedFilenames) {
    try {
      const result = await processImage(filename);
      if (result.status === 'success' || result.status === 'copied transparent original' || result.status === 'already processed') {
        successFiles.push({ filename: result.filename, method: result.method || 'copied/original' });
      } else {
        failedFiles.push({ filename: result.filename, status: result.status });
      }
    } catch (error) {
      console.warn(`Skipping ${filename} due to processing error:`, error.message || error);
      failedFiles.push({ filename, status: 'error' });
    }
  }

  const processedFiles = await listProcessedFiles();
  await buildManifest(processedFiles);

  console.log('--- Image Processing Report ---');
  console.log('✓ Successfully processed:');
  successFiles.forEach((entry) => console.log(`  ✓ ${entry.filename} (${entry.method})`));
  if (failedFiles.length > 0) {
    console.log('✗ Failed background removal:');
    failedFiles.forEach((entry) => console.log(`  ✗ ${entry.filename} (${entry.status})`));
  }
  console.log(`Processed ${successFiles.length} images successfully.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

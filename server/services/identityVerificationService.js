import fs from 'fs/promises';
import { existsSync } from 'fs';
import crypto from 'crypto';
import os from 'os';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const REFERENCE_DATE = new Date('2026-06-30T00:00:00.000Z');

function normalizeText(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeForCompare(value = '') {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function normalizeNameTokens(value = '') {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function namesMatch(customerName, ocrName) {
  const customerNormalized = normalizeForCompare(customerName);
  const ocrNormalized = normalizeForCompare(ocrName);

  if (!customerNormalized || !ocrNormalized) return false;
  if (customerNormalized === ocrNormalized) return true;

  const customerTokens = normalizeNameTokens(customerName);
  const ocrTokens = normalizeNameTokens(ocrName);

  if (!customerTokens.length || !ocrTokens.length) return false;
  if (customerTokens[0] === ocrTokens[0] && customerTokens[customerTokens.length - 1] === ocrTokens[ocrTokens.length - 1]) return true;
  if (customerTokens[0] === ocrTokens[0] || customerTokens[customerTokens.length - 1] === ocrTokens[ocrTokens.length - 1]) return true;

  return false;
}

function cleanIdentifier(value = '') {
  return normalizeForCompare(value);
}

function logStage(stage, details) {
  console.log(`[OCR][${stage}]`, JSON.stringify(details));
}

function logDebugSection(title, details) {
  const separator = '================================';
  const entries = [separator, title, separator];
  for (const [key, value] of Object.entries(details)) {
    entries.push(`${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`);
  }
  console.log(entries.join('\n'));
}

async function getFileDiagnostics(filePath) {
  const diagnostics = {
    filePath,
    actualPath: path.resolve(filePath),
    exists: existsSync(filePath),
    fileSize: null,
    firstBytesHex: null,
    firstBytesAscii: null,
    sha256: null,
    beginsWithPdf: false,
  };

  if (!diagnostics.exists) {
    return diagnostics;
  }

  const buffer = await fs.readFile(filePath);
  diagnostics.fileSize = buffer.length;
  const header = buffer.subarray(0, 16);
  diagnostics.firstBytesHex = Array.from(header).map(b => b.toString(16).padStart(2, '0')).join(' ');
  diagnostics.firstBytesAscii = header.toString('ascii').replace(/[^\x20-\x7E]/g, '.');
  diagnostics.sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
  diagnostics.beginsWithPdf = header.toString('latin1').startsWith('%PDF');
  return diagnostics;
}

function resolveExecutable(commandName, envVarName) {
  const expectedBaseNames = {
    pdftoppm: ['pdftoppm', 'pdftoppm.exe'],
    tesseract: ['tesseract', 'tesseract.exe'],
  };

  const isExpectedExecutable = (candidatePath) => {
    const baseName = path.basename(candidatePath).toLowerCase();
    return expectedBaseNames[commandName]?.includes(baseName);
  };

  const normalizeCandidate = (candidatePath) => {
    return path.normalize(candidatePath).replace(/\\/g, '/');
  };

  const resolveIfValid = (candidatePath) => {
    if (!candidatePath) return null;
    try {
      const resolved = normalizeCandidate(candidatePath);
      if (!existsSync(resolved)) return null;
      if (!isExpectedExecutable(resolved)) return null;
      return resolved;
    } catch {
      return null;
    }
  };

  if (process.env[envVarName]) {
    const configuredPath = process.env[envVarName];
    const resolved = resolveIfValid(configuredPath);
    if (resolved) {
      return resolved;
    }
  }

  const windowsLocations = [];
  if (commandName === 'tesseract') {
    windowsLocations.push(
      'C:/Program Files/Tesseract-OCR/tesseract.exe',
      'C:/Program Files (x86)/Tesseract-OCR/tesseract.exe',
      'C:/Program Files/Tesseract-OCR/Tesseract.exe',
      'C:/Program Files (x86)/Tesseract-OCR/Tesseract.exe',
      'C:/Users/Jahnavi K S/AppData/Local/Microsoft/WinGet/Packages/UB-Mannheim.TesseractOCR_Microsoft.Winget.Source_8wekyb3d8bbwe/tesseract.exe',
    );
  }

  if (commandName === 'pdftoppm') {
    windowsLocations.push(
      'C:/Program Files/poppler/Library/bin/pdftoppm.exe',
      'C:/Program Files/poppler/bin/pdftoppm.exe',
      'C:/poppler/bin/pdftoppm.exe',
      'C:/Program Files (x86)/poppler/bin/pdftoppm.exe',
      'C:/Users/Jahnavi K S/AppData/Local/Microsoft/WinGet/Packages/oschwartz10612.Poppler_Microsoft.Winget.Source_8wekyb3d8bbwe/poppler-25.07.0/Library/bin/pdftoppm.exe',
    );
  }

  for (const candidate of windowsLocations) {
    const resolved = resolveIfValid(candidate);
    if (resolved) {
      return resolved;
    }
  }

  const pathEntries = (process.env.PATH || '')
    .split(path.delimiter)
    .filter(Boolean);

  for (const entry of pathEntries) {
    const candidates = [
      path.join(entry, commandName),
      path.join(entry, `${commandName}.exe`),
    ];
    for (const candidate of candidates) {
      const resolved = resolveIfValid(candidate);
      if (resolved) {
        return resolved;
      }
    }
  }

  if (commandName === 'pdftoppm') {
    throw new Error('Poppler (pdftoppm.exe) was not found.');
  }

  return null;
}

function countryMatches(customerCountry, ocrNationality) {
  const normalizedCountry = normalizeForCompare(customerCountry);
  const normalizedNationality = normalizeForCompare(ocrNationality);

  if (!normalizedCountry || !normalizedNationality) return true;
  if (normalizedCountry === normalizedNationality) return true;
  if (normalizedCountry.startsWith(normalizedNationality) || normalizedNationality.startsWith(normalizedCountry)) return true;

  const countryAliases = {
    INDIA: ['INDIAN'],
    INDIAN: ['INDIA'],
  };

  return countryAliases[normalizedCountry]?.includes(normalizedNationality) || countryAliases[normalizedNationality]?.includes(normalizedCountry);
}

function parseDate(value) {
  const raw = normalizeText(value);
  if (!raw) return null;

  const candidates = raw.match(/\d{4}-\d{2}-\d{2}|\d{2}[/-]\d{2}[/-]\d{2,4}/g) || [];
  if (!candidates.length) return null;

  const candidate = candidates[0];
  const parts = candidate.includes('-') ? candidate.split('-') : candidate.split(/[/-]/);
  if (parts.length !== 3) return null;

  const first = Number(parts[0]);
  const second = Number(parts[1]);
  const third = Number(parts[2]);

  if (parts[0].length === 4) {
    return new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
  }

  const day = first;
  const month = second;
  const year = third < 100 ? (third < 70 ? 2000 + third : 1900 + third) : third;
  return new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
}

function calculateAge(dob) {
  if (!dob) return null;
  const diff = REFERENCE_DATE.getTime() - dob.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function parseDocumentNumber(text, documentType) {
  const cleaned = normalizeText(text);
  if (!cleaned) return null;

  if (documentType === 'aadhaar') {
    const aadhaarPattern = cleaned.match(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/);
    if (aadhaarPattern) return cleanIdentifier(aadhaarPattern[0]);
    const digitsOnly = cleaned.match(/\b\d{12}\b/);
    if (digitsOnly) return cleanIdentifier(digitsOnly[0]);
  }

  const labelPattern = cleaned.match(/(?:license|licence|passport|aadhaar|document|number|no)\s*[:#-]?\s*([A-Z0-9\s/-]{2,})/i);
  if (labelPattern) return cleanIdentifier(labelPattern[1]);

  const fallback = cleaned.match(/\b([A-Z0-9]{3,})\b/);
  return fallback ? cleanIdentifier(fallback[1]) : null;
}

function extractName(text) {
  const cleaned = normalizeText(text);
  const lines = cleaned.split(/\n+/).map(line => line.trim()).filter(Boolean);

  for (const line of lines) {
    const labeled = line.match(/(?:full\s*name|name)\s*[:#-]?\s*([A-Z][A-Z\s.]{2,})/i);
    if (labeled) return labeled[1].replace(/\s+/g, ' ').trim();
  }

  for (const line of lines) {
    if (/\d/.test(line)) continue;
    if (line.length < 3 || line.length > 80) continue;
    const words = line.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.every(word => /^[A-Z][A-Z.]+$/i.test(word) || /^[A-Z][A-Z.-]+$/i.test(word))) {
      return line.replace(/\s+/g, ' ').trim();
    }
  }

  return null;
}

function extractAddress(text) {
  const cleaned = normalizeText(text);
  const match = cleaned.match(/(?:address)\s*[:#-]?\s*([A-Z0-9,./\s-]{4,})/i);
  return match?.[1] || null;
}

function extractNationality(text) {
  const cleaned = normalizeText(text);
  const match = cleaned.match(/(?:nationality)\s*[:#-]?\s*([A-Z\s]{2,})/i);
  return match?.[1] || null;
}

function parseFields(documentType, rawText) {
  const parsed = {
    fullName: extractName(rawText),
    documentNumber: parseDocumentNumber(rawText, documentType),
    dob: null,
    address: extractAddress(rawText),
    expiryDate: null,
    nationality: null,
  };

  const dobMatch = rawText.match(/(?:dob|date of birth|date of birth\s*[:#-]?|birth\s*date)\s*[:#-]?\s*([0-9]{2}[/-][0-9]{2}[/-][0-9]{2,4}|[0-9]{4}-[0-9]{2}-[0-9]{2})/i);
  if (dobMatch) parsed.dob = dobMatch[1];

  const expiryMatch = rawText.match(/(?:expiry|exp|valid until|valid upto|expires)\s*[:#-]?\s*([0-9]{2}[/-][0-9]{2}[/-][0-9]{2,4}|[0-9]{4}-[0-9]{2}-[0-9]{2})/i);
  if (expiryMatch) parsed.expiryDate = expiryMatch[1];

  if (documentType === 'passport') parsed.nationality = extractNationality(rawText);

  return parsed;
}

async function isValidPdfFile(filePath) {
  try {
    const buffer = await fs.readFile(filePath);
    const header = buffer.subarray(0, 8).toString('latin1');
    return header.includes('%PDF-');
  } catch {
    return false;
  }
}

async function extractTextWithPdfParse(filePath) {
  try {
    const pdfParseModule = await import('pdf-parse/lib/pdf-parse.js');
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    const rawText = normalizeText(data?.text || '');

    if (rawText) {
      return { ok: true, rawText, provider: 'pdf-parse' };
    }
  } catch (error) {
    logStage('PDF Parse Fallback', { succeeded: false, error: error?.message || String(error) });
  }

  return { ok: false, rawText: '', provider: 'pdf-parse' };
}

async function convertPdfToImages(filePath) {
  const pdftoppmPath = resolveExecutable('pdftoppm', 'PDFTOPPM_PATH');
  const diagnostics = await getFileDiagnostics(filePath);
  const uploadSection = {
    'Original filename': path.basename(filePath),
    'Mime type': 'application/pdf',
    'Extension': path.extname(filePath),
    'Size': diagnostics.fileSize,
    'Temp path': filePath,
  };

  logDebugSection('UPLOAD', uploadSection);

  logDebugSection('FILE CHECK', {
    'Does file exist?': diagnostics.exists,
    'File size': diagnostics.fileSize,
    'First 16 bytes (hex)': diagnostics.firstBytesHex,
    'First 16 bytes (ascii)': diagnostics.firstBytesAscii,
    'SHA256': diagnostics.sha256,
  });

  logDebugSection('PDF CHECK', {
    'Is mimetype application/pdf?': true,
    'Does the file begin with %PDF ?': diagnostics.beginsWithPdf,
  });

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ocr-'));
  const outputBase = path.join(tempDir, 'page');
  const exactArgs = ['-png', '-r', '300', filePath, outputBase];
  const exactCommand = `${pdftoppmPath || 'pdftoppm:not-found'} ${exactArgs.map(a => JSON.stringify(a)).join(' ')}`;

  logDebugSection('POPPLER', {
    'Exact executable path': pdftoppmPath,
    'Exact command executed': exactCommand,
    'Temp path exists before poppler': existsSync(tempDir),
    'File path passed to pdftoppm': filePath,
    'Resolved file path': path.resolve(filePath),
  });

  let stdout = '';
  let stderr = '';
  let exitCode = null;

  try {
    const result = await execFileAsync(pdftoppmPath, exactArgs, { maxBuffer: 1024 * 1024 * 50 });
    stdout = result.stdout || '';
    stderr = result.stderr || '';
    exitCode = 0;
    const files = await fs.readdir(tempDir);
    const imagePaths = files.filter(file => file.endsWith('.png')).map(file => path.join(tempDir, file)).sort();

    logDebugSection('POPPLER', {
      'Exact executable path': pdftoppmPath,
      'Exact command executed': exactCommand,
      'Exit code': exitCode,
      stderr,
      stdout,
      'Temp path exists after poppler': existsSync(tempDir),
      'File path passed to pdftoppm': filePath,
      'Resolved file path': path.resolve(filePath),
    });

    if (!imagePaths.length) {
      return { ok: false, reason: 'OCR extraction failed because the PDF conversion produced no images.', tempDir, imagePaths, poppler: { command: exactCommand, exitCode, stderr, stdout } };
    }

    logDebugSection('OCR', {
      'Converted images': imagePaths,
      'Image count': imagePaths.length,
      'OCR text length': 0,
      'First 500 OCR characters': '',
    });

    return { ok: true, reason: null, tempDir, imagePaths, poppler: { command: exactCommand, exitCode, stderr, stdout } };
  } catch (error) {
    stderr = error?.stderr || error?.message || String(error);
    stdout = error?.stdout || '';
    exitCode = typeof error?.code === 'number' ? error.code : 1;

    logDebugSection('POPPLER', {
      'Exact executable path': pdftoppmPath,
      'Exact command executed': exactCommand,
      'Exit code': exitCode,
      stderr,
      stdout,
      'Temp path exists after poppler': existsSync(tempDir),
      'File path passed to pdftoppm': filePath,
      'Resolved file path': path.resolve(filePath),
    });

    return { ok: false, reason: `OCR extraction failed because Poppler conversion failed: ${stderr || stdout || error.message}`, tempDir, imagePaths: [], poppler: { command: exactCommand, exitCode, stderr, stdout } };
  }
}

async function runTesseractOCR(imagePath) {
  const tesseractPath = resolveExecutable('tesseract', 'TESSERACT_PATH');
  if (!tesseractPath) {
    return { ok: false, reason: 'OCR extraction failed because Tesseract executable was not found.' };
  }

  const startedAt = Date.now();
  logStage('OCR Extraction', { started: true, imagePath, tesseractPath });

  try {
    const { stdout, stderr } = await execFileAsync(tesseractPath, [imagePath, 'stdout', '--psm', '6'], { maxBuffer: 1024 * 1024 * 50 });
    const executionTimeMs = Date.now() - startedAt;
    logStage('OCR Extraction', { completed: true, executionTimeMs, stderr: stderr || null });
    return { ok: true, rawText: stdout || '', executionTimeMs, reason: null };
  } catch (error) {
    const executionTimeMs = Date.now() - startedAt;
    const details = error?.stderr || error?.message || String(error);
    logStage('OCR Extraction', { completed: false, executionTimeMs, error: details });
    return { ok: false, reason: `OCR extraction failed because Tesseract execution failed: ${details}` };
  }
}

export async function extract(filePath, mimeType = 'image/png') {
  const uploadMeta = {
    filePath,
    mimeType,
    sizeBytes: null,
  };

  try {
    const stats = await fs.stat(filePath);
    uploadMeta.sizeBytes = stats.size;
  } catch (error) {
    uploadMeta.sizeBytes = null;
  }

  logStage('Upload', uploadMeta);

  if (!filePath) {
    return { provider: 'none', raw: '', confidence: 0, parsedFields: {}, failureReason: 'OCR extraction failed because no file path was provided.' };
  }

  if (mimeType === 'application/pdf') {
    const pdfConversion = await convertPdfToImages(filePath);
    if (!pdfConversion.ok) {
      return { provider: 'pdf-poppler', raw: '', confidence: 0, parsedFields: {}, failureReason: pdfConversion.reason, poppler: pdfConversion.poppler };
    }

    const pageTexts = [];
    for (const imagePath of pdfConversion.imagePaths) {
      const result = await runTesseractOCR(imagePath);
      if (!result.ok) {
        await Promise.all(pdfConversion.imagePaths.map(image => fs.unlink(image).catch(() => {})));
        await fs.rm(pdfConversion.tempDir, { recursive: true, force: true }).catch(() => {});
        return { provider: 'pdf-poppler', raw: '', confidence: 0, parsedFields: {}, failureReason: result.reason, poppler: pdfConversion.poppler };
      }
      if (result.rawText && result.rawText.trim()) {
        pageTexts.push(result.rawText.trim());
      }
    }

    await Promise.all(pdfConversion.imagePaths.map(image => fs.unlink(image).catch(() => {})));
    await fs.rm(pdfConversion.tempDir, { recursive: true, force: true }).catch(() => {});

    const rawText = pageTexts.join('\n\n');
    logDebugSection('OCR', {
      'Converted images': pdfConversion.imagePaths,
      'Image count': pdfConversion.imagePaths.length,
      'OCR text length': rawText.length,
      'First 500 OCR characters': rawText.slice(0, 500),
    });
    console.log('OCR TEXT:\n------------------------\n' + rawText + '\n------------------------');

    if (!rawText.trim()) {
      return { provider: 'pdf-poppler', raw: '', confidence: 0, parsedFields: {}, failureReason: 'OCR extraction failed because the PDF conversion produced no readable text.', poppler: pdfConversion.poppler };
    }

    return { provider: 'pdf-poppler', raw: rawText, confidence: 0.92, parsedFields: {} };
  }

  const imageResult = await runTesseractOCR(filePath);
  if (!imageResult.ok) {
    return { provider: 'tesseract', raw: '', confidence: 0, parsedFields: {}, failureReason: imageResult.reason };
  }

  const rawText = imageResult.rawText || '';
  logStage('OCR Extraction', { rawText });
  console.log('OCR TEXT:\n------------------------\n' + rawText + '\n------------------------');

  if (!rawText.trim()) {
    return { provider: 'tesseract', raw: '', confidence: 0, parsedFields: {}, failureReason: 'OCR extraction failed because Tesseract returned empty text.' };
  }

  return { provider: 'tesseract', raw: rawText, confidence: imageResult.executionTimeMs ? 0.9 : 0.8, parsedFields: {} };
}

export function verifyIdentity({ documentType, fullName, documentNumber, country }, parsedFields, rawText, extractionContext = {}) {
  const normalizedUserName = normalizeText(fullName);
  const normalizedOcrName = normalizeText(parsedFields?.fullName || extractName(rawText) || '');
  const normalizedUserDocumentNumber = cleanIdentifier(documentNumber);
  const normalizedOcrDocumentNumber = cleanIdentifier(parsedFields?.documentNumber || '');

  const nameMatch = namesMatch(normalizedUserName, normalizedOcrName);
  const documentNumberMatch = normalizedUserDocumentNumber === normalizedOcrDocumentNumber;
  const expiryDate = parsedFields?.expiryDate ? parseDate(parsedFields.expiryDate) : null;
  const dobParsed = parsedFields?.dob ? parseDate(parsedFields.dob) : null;
  const age = dobParsed ? calculateAge(dobParsed) : null;
  const countryMatch = !country || !parsedFields?.nationality || !['passport'].includes(documentType)
    ? true
    : countryMatches(country, parsedFields.nationality);

  const detailLog = {
    documentType,
    userName: normalizedUserName,
    userDocumentNumber: normalizedUserDocumentNumber,
    parsedName: normalizedOcrName,
    parsedDocumentNumber: normalizedOcrDocumentNumber,
    parsedDob: parsedFields?.dob || null,
    parsedExpiryDate: parsedFields?.expiryDate || null,
    verificationResult: null,
    failureReason: null,
  };

  if (!normalizedOcrName || !normalizedOcrDocumentNumber) {
    const failureReason = extractionContext?.failureReason || 'OCR extraction failed because the extracted text did not contain a readable name or document number.';
    detailLog.verificationResult = 'failed';
    detailLog.failureReason = failureReason;
    logStage('Verification', detailLog);
    return {
      passed: false,
      status: 'failed',
      message: failureReason,
      notes: failureReason,
      failureReason,
    };
  }

  if (!nameMatch) {
    detailLog.verificationResult = 'failed';
    detailLog.failureReason = 'Name mismatch';
    console.log('[OCR] Verification step:', JSON.stringify(detailLog));
    return {
      passed: false,
      status: 'failed',
      message: '⚠️ Verification Hold: Action Required.Our secure digital scanner was unable to authenticate your document in real-time.Mismatch Detected:The typed name or ID number does not correlate with the uploaded document.Potential Issue:Blurry imageCamera flashCropped documentNext Steps:Verify spelling or upload a clearer image.',
      notes: 'Name mismatch against OCR text.',
      failureReason: 'Name mismatch',
    };
  }

  if (!documentNumberMatch) {
    detailLog.verificationResult = 'failed';
    detailLog.failureReason = 'Document number mismatch';
    console.log('[OCR] Verification step:', JSON.stringify(detailLog));
    return {
      passed: false,
      status: 'failed',
      message: '⚠️ Verification Hold: Action Required.Our secure digital scanner was unable to authenticate your document in real-time.Mismatch Detected:The typed name or ID number does not correlate with the uploaded document.Potential Issue:Blurry imageCamera flashCropped documentNext Steps:Verify spelling or upload a clearer image.',
      notes: 'Document number mismatch against OCR text.',
      failureReason: 'Document number mismatch',
    };
  }

  if (expiryDate && expiryDate < REFERENCE_DATE) {
    detailLog.verificationResult = 'failed';
    detailLog.failureReason = 'Document expired';
    console.log('[OCR] Verification step:', JSON.stringify(detailLog));
    return {
      passed: false,
      status: 'failed',
      message: '❌ Verification FailedThe uploaded government document has expired.For insurance and liability protection we require a valid document before releasing any vehicle.',
      notes: 'Document has expired.',
      failureReason: 'Document expired',
    };
  }

  if (age !== null && age < 21) {
    detailLog.verificationResult = 'failed';
    detailLog.failureReason = 'Under age';
    console.log('[OCR] Verification step:', JSON.stringify(detailLog));
    return {
      passed: false,
      status: 'restricted',
      message: '❌ Booking RestrictedAge Requirement Not Met.Drivers must be at least 21 years old.',
      notes: 'Applicant is below the minimum age requirement.',
      failureReason: 'Under age',
    };
  }

  if (!countryMatch) {
    detailLog.verificationResult = 'failed';
    detailLog.failureReason = 'Country mismatch';
    console.log('[OCR] Verification step:', JSON.stringify(detailLog));
    return {
      passed: false,
      status: 'failed',
      message: '⚠️ Verification Hold: Action Required.Our secure digital scanner was unable to authenticate your document in real-time.Mismatch Detected:The typed name or ID number does not correlate with the uploaded document.Potential Issue:Blurry imageCamera flashCropped documentNext Steps:Verify spelling or upload a clearer image.',
      notes: 'Country or nationality could not be matched.',
      failureReason: 'Country mismatch',
    };
  }

  detailLog.verificationResult = 'verified';
  detailLog.failureReason = null;
  console.log('[OCR] Verification step:', JSON.stringify(detailLog));
  return {
    passed: true,
    status: 'verified',
    message: '✨ Identity Verified & Fleet SecuredYour identity documentation has successfully cleared our digital vault layer.Your selected vehicle is fully reserved and guaranteed for your itinerary dates.Your premium rental invoice, garage directions, and arrival instructions have been generated and dispatched to your registered email and WhatsApp channels.',
    notes: 'Document verified successfully.',
    failureReason: null,
  };
}

export async function debugPdfConversion(filePath) {
  return convertPdfToImages(filePath);
}

export function parseIdentityFields(documentType, rawText) {
  return parseFields(documentType, rawText);
}

export { resolveExecutable };
export default { extract, verifyIdentity, parseIdentityFields, debugPdfConversion };

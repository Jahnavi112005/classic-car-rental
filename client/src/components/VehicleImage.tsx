import { useEffect, useState } from 'react';
import { Car } from '../types';
import { getVehicleImage } from '../utils/vehicleImage';

const imageAnalysisCache = new Map<string, ImageAnalysis>();

type ImageAnalysis = {
  hasTransparency: boolean;
  whiteBackground: boolean;
  needsReplacement: boolean;
};

type VehicleImageProps = {
  vehicle: Partial<Pick<Car, 'name' | 'year' | 'image' | 'images'>>;
  alt?: string;
  wrapperClassName?: string;
  imgClassName?: string;
  wrapperStyle?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
};

function isWhitePixel(r: number, g: number, b: number, a: number) {
  return a > 240 && r > 240 && g > 240 && b > 240;
}

function analyzeImageUrl(url: string): Promise<ImageAnalysis> {
  if (imageAnalysisCache.has(url)) {
    return Promise.resolve(imageAnalysisCache.get(url)!);
  }

  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = url;

    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const maxDimension = 200;
        const scale = Math.min(1, maxDimension / image.naturalWidth, maxDimension / image.naturalHeight);
        const width = Math.max(1, Math.floor(image.naturalWidth * scale));
        const height = Math.max(1, Math.floor(image.naturalHeight * scale));
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context unavailable');
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height).data;

        let transparentCount = 0;
        let whiteEdgeCount = 0;
        let edgeCount = 0;
        const sampleStepX = Math.max(1, Math.floor(width / 20));
        const sampleStepY = Math.max(1, Math.floor(height / 20));

        for (let y = 0; y < height; y += sampleStepY) {
          for (let x = 0; x < width; x += sampleStepX) {
            const index = (y * width + x) * 4;
            const a = imageData[index + 3];
            if (a < 250) {
              transparentCount += 1;
            }
          }
        }

        for (let x = 0; x < width; x += sampleStepX) {
          const topIndex = (0 * width + x) * 4;
          const bottomIndex = ((height - 1) * width + x) * 4;
          const topPixel: [number, number, number, number] = [
            imageData[topIndex],
            imageData[topIndex + 1],
            imageData[topIndex + 2],
            imageData[topIndex + 3],
          ];
          const bottomPixel: [number, number, number, number] = [
            imageData[bottomIndex],
            imageData[bottomIndex + 1],
            imageData[bottomIndex + 2],
            imageData[bottomIndex + 3],
          ];
          whiteEdgeCount += isWhitePixel(...topPixel) ? 1 : 0;
          whiteEdgeCount += isWhitePixel(...bottomPixel) ? 1 : 0;
          edgeCount += 2;
        }

        for (let y = 0; y < height; y += sampleStepY) {
          const leftIndex = (y * width + 0) * 4;
          const rightIndex = (y * width + (width - 1)) * 4;
          const leftPixel: [number, number, number, number] = [
            imageData[leftIndex],
            imageData[leftIndex + 1],
            imageData[leftIndex + 2],
            imageData[leftIndex + 3],
          ];
          const rightPixel: [number, number, number, number] = [
            imageData[rightIndex],
            imageData[rightIndex + 1],
            imageData[rightIndex + 2],
            imageData[rightIndex + 3],
          ];
          whiteEdgeCount += isWhitePixel(...leftPixel) ? 1 : 0;
          whiteEdgeCount += isWhitePixel(...rightPixel) ? 1 : 0;
          edgeCount += 2;
        }

        const hasTransparency = transparentCount > 0;
        const whiteBackground = !hasTransparency && edgeCount > 0 && whiteEdgeCount / edgeCount > 0.75;
        const needsReplacement = !hasTransparency && whiteBackground;
        const result = { hasTransparency, whiteBackground, needsReplacement };
        imageAnalysisCache.set(url, result);
        resolve(result);
      } catch (error) {
        const fallback = { hasTransparency: false, whiteBackground: false, needsReplacement: false };
        imageAnalysisCache.set(url, fallback);
        resolve(fallback);
      }
    };

    image.onerror = () => {
      const fallback = { hasTransparency: false, whiteBackground: false, needsReplacement: false };
      imageAnalysisCache.set(url, fallback);
      resolve(fallback);
    };
  });
}

export default function VehicleImage({
  vehicle,
  alt,
  wrapperClassName = '',
  imgClassName = '',
  wrapperStyle,
  imgStyle,
}: VehicleImageProps) {
  const src = getVehicleImage(vehicle);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(() => imageAnalysisCache.get(src) ?? null);

  useEffect(() => {
    let active = true;
    if (!imageAnalysisCache.has(src)) {
      analyzeImageUrl(src).then((result) => {
        if (!active) return;
        setAnalysis(result);
      });
    } else {
      setAnalysis(imageAnalysisCache.get(src)!);
    }
    return () => {
      active = false;
    };
  }, [src]);

  const showWhiteBlend = analysis?.whiteBackground;
  const showReplacementNote = analysis?.needsReplacement;

  return (
    <div
      className={`vehicle-image-panel ${wrapperClassName}`}
      style={wrapperStyle}
      data-white-bg={showWhiteBlend ? 'true' : 'false'}
      data-needs-replacement={showReplacementNote ? 'true' : 'false'}
    >
      <div className="vehicle-image-panel__spotlight" />
      <img
        src={src}
        alt={alt || vehicle?.name || 'Vehicle'}
        className={`vehicle-image-panel__image ${imgClassName}`}
        style={imgStyle}
        crossOrigin="anonymous"
      />
      <div className="vehicle-image-panel__floor-shadow" />
    </div>
  );
}

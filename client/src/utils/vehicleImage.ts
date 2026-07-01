import { Car } from '../types';
import { PROCESSED_VEHICLE_IMAGES } from './processedVehicleImages';

export const VEHICLE_IMAGE_FOLDER = '/assets/images/cars';
export const VEHICLE_IMAGE_PROCESSED_FOLDER = '/assets/images/cars/processed';
export const DEFAULT_VEHICLE_IMAGE = 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=600';

const carImageFilenames = [
  'Honda Amaze.png',
  'Honda City.png',
  'Hyundai Creta.png',
  'Hyundai i10.png',
  'Hyundai i20.png',
  'Hyundai Verna.png',
  'Mahindra Thar.png',
  'Mahindra XUV500 W10.png',
  'Mahindra XUV500 W8.png',
  'Maruti Baleno.png',
  'Maruti Brezza.png',
  'Maruti Celerio.png',
  'Maruti Ciaz.png',
  'Maruti Ertiga.png',
  'Maruti Swift.(2011-2015).png',
  'Maruti Swift(2015-2017).png',
  'Maruti Swift(2018-2023).png',
  'Maruti Swift.png',
  'Renault Duster.png',
  'Toyota Etios Liva.png',
  'Toyota Etios.png',
  'Toyota Fortuner Legender.png',
  'Toyota Fortuner.png',
  'Toyota Innova Crysta.png',
  'Toyota Innova Hycross.png',
  'Toyota Innova(2012-2016).png',
  'Toyota Innova.png',
];

type ImageCandidate = {
  filename: string;
  url: string;
  baseNormalized: string;
  yearFrom?: number;
  yearTo?: number;
  hasYear: boolean;
};

const imageCandidates: ImageCandidate[] = carImageFilenames.map((filename) => {
  const baseFilename = filename.replace(/\.[^.]+$/, '');
  const { baseName, yearFrom, yearTo } = parseFilename(baseFilename);

  return {
    filename,
    url: `${VEHICLE_IMAGE_FOLDER}/${encodeURIComponent(filename)}`,
    baseNormalized: normalizeText(baseName),
    yearFrom,
    yearTo,
    hasYear: typeof yearFrom === 'number' && typeof yearTo === 'number',
  };
});

function normalizeText(value: string) {
  const lower = String(value).toLowerCase();
  const removed = lower.replace(/[-]+/g, '');
  const removedYears = removed.replace(/\d{4}(?:-\d{4})?/g, '');
  return removedYears.replace(/[^a-z0-9]/g, '');
}

function parseFilename(filename: string) {
  const match = filename.match(/^(.*?)(?:\(?([0-9]{4})(?:-([0-9]{4}))?\)?)?$/);
  if (!match) {
    return { baseName: filename, yearFrom: undefined, yearTo: undefined };
  }

  const baseName = match[1].trim();
  const yearFrom = match[2] ? Number(match[2]) : undefined;
  const yearTo = match[3] ? Number(match[3]) : yearFrom;

  return { baseName, yearFrom, yearTo };
}

function parseVehicleYear(value: Car['year'] | undefined) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return numeric;
    }

    const match = value.match(/([0-9]{4})/);
    if (match) {
      return Number(match[1]);
    }
  }

  return undefined;
}

function chooseBestCandidate(candidates: ImageCandidate[]) {
  return candidates.reduce((best, candidate) => {
    if (!best) return candidate;
    if (candidate.baseNormalized.length < best.baseNormalized.length) return candidate;
    return best;
  }, candidates[0]);
}

function getBestYearMatch(baseNormalized: string, year?: number) {
  if (!year) {
    return null;
  }

  const yearMatches = imageCandidates.filter((candidate) =>
    candidate.baseNormalized === baseNormalized && candidate.hasYear && candidate.yearFrom !== undefined && candidate.yearTo !== undefined && year >= candidate.yearFrom && year <= candidate.yearTo
  );

  if (yearMatches.length > 0) {
    return chooseBestCandidate(yearMatches).url;
  }

  return null;
}

function getBestNameMatch(baseNormalized: string) {
  const exactMatches = imageCandidates.filter((candidate) =>
    candidate.baseNormalized === baseNormalized && !candidate.hasYear
  );

  if (exactMatches.length > 0) {
    return chooseBestCandidate(exactMatches).url;
  }

  const partialMatches = imageCandidates.filter((candidate) =>
    candidate.baseNormalized.includes(baseNormalized) || baseNormalized.includes(candidate.baseNormalized)
  );

  if (partialMatches.length > 0) {
    return chooseBestCandidate(partialMatches).url;
  }

  return null;
}

function getFilenameFromUrl(url: string) {
  const parts = String(url).split('/');
  return decodeURIComponent(parts[parts.length - 1] || '');
}

function getProcessedImageUrl(filename: string) {
  const baseFilename = getFilenameFromUrl(filename);
  if (PROCESSED_VEHICLE_IMAGES.has(baseFilename)) {
    return `${VEHICLE_IMAGE_PROCESSED_FOLDER}/${encodeURIComponent(baseFilename)}`;
  }
  return null;
}

export function getVehicleImage(vehicle: Partial<Pick<Car, 'name' | 'year' | 'image' | 'images'>>) {
  const explicitImage = String(vehicle?.image || '').trim();
  if (explicitImage) {
    const processedExplicit = getProcessedImageUrl(explicitImage);
    return processedExplicit || explicitImage;
  }

  const vehicleName = String(vehicle?.name || '').trim();
  const normalizedVehicleName = normalizeText(vehicleName);
  const year = parseVehicleYear(vehicle?.year);

  const nameMatch = getBestNameMatch(normalizedVehicleName);
  if (year) {
    const yearMatch = getBestYearMatch(normalizedVehicleName, year);
    if (yearMatch) {
      const processed = getProcessedImageUrl(yearMatch);
      return processed || yearMatch;
    }
  }

  if (nameMatch) {
    const processed = getProcessedImageUrl(nameMatch);
    return processed || nameMatch;
  }

  const imageArrayPath = String(vehicle?.images?.[0] || '').trim();
  if (imageArrayPath) {
    const processedImageArrayPath = getProcessedImageUrl(imageArrayPath);
    return processedImageArrayPath || imageArrayPath;
  }

  return DEFAULT_VEHICLE_IMAGE;
}

export const getVehicleImagePath = getVehicleImage;

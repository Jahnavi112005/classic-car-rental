import fs from 'fs';
import path from 'path';

async function googleVisionExtract(url) {
  // lazy-load the client so module is optional in development
  const { ImageAnnotatorClient } = await import('@google-cloud/vision').catch(() => ({}));
  if (!ImageAnnotatorClient) {
    throw new Error('Google Vision client not installed');
  }
  const client = new ImageAnnotatorClient();
  const [result] = await client.textDetection(url);
  const detections = result.textAnnotations || [];
  const raw = detections[0]?.description || '';
  return { provider: 'google', raw, confidence: detections[0]?.score ?? null };
}

async function stubExtract(_url) {
  // Return a deterministic stub useful for development and tests
  return {
    provider: 'stub',
    raw: 'Name: Test User\nDocument No: ABC1234\nDOB: 1990-01-01\nAddress: 123 Test St',
    confidence: 0.98,
    fields: {
      name: { value: 'Test User', confidence: 0.98 },
      document_number: { value: 'ABC1234', confidence: 0.99 },
      dob: { value: '1990-01-01', confidence: 0.95 },
      address: { value: '123 Test St', confidence: 0.9 },
    },
  };
}

export async function extract(fileUrl) {
  // Prefer Google Vision if credentials available
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_API_KEY) {
    try {
      return await googleVisionExtract(fileUrl);
    } catch (err) {
      // fallthrough to stub
      console.warn('Google Vision failed, falling back to stub OCR:', err.message || err);
      return stubExtract(fileUrl);
    }
  }
  return stubExtract(fileUrl);
}

export default { extract };

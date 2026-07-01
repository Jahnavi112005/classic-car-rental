export type IdentityDocumentType = 'driving_license' | 'aadhaar' | 'passport' | 'pan' | '';

export interface DocumentValidationResult {
  isValid: boolean | null;
  message: string;
  normalizedValue: string;
}

export function getDocumentPlaceholder(type: IdentityDocumentType) {
  switch (type) {
    case 'aadhaar':
      return '2419 8335 6143';
    case 'driving_license':
      return 'KA01 20230001234';
    case 'passport':
      return 'P1234567';
    case 'pan':
      return 'ABCDE1234F';
    default:
      return 'Enter document number';
  }
}

export function getDocumentHelperText(type: IdentityDocumentType) {
  switch (type) {
    case 'aadhaar':
      return 'Example: 2419 8335 6143 (12 digits)';
    case 'driving_license':
      return 'Example: KA01 20230001234';
    case 'passport':
      return 'Example: P1234567';
    case 'pan':
      return 'Example: ABCDE1234F';
    default:
      return '';
  }
}

export function formatDocumentNumberInput(type: IdentityDocumentType, value: string) {
  const raw = String(value || '');

  if (type === 'aadhaar') {
    return raw.replace(/[^\d\s]/g, '').slice(0, 16);
  }

  if (type === 'driving_license') {
    return raw.replace(/[^A-Z0-9\s-]/gi, '').toUpperCase().slice(0, 20);
  }

  if (type === 'passport') {
    return raw.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8);
  }

  if (type === 'pan') {
    return raw.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 10);
  }

  return raw;
}

export function sanitizeDocumentNumber(type: IdentityDocumentType, value: string) {
  const trimmed = String(value || '').trim();

  if (!trimmed) return '';

  switch (type) {
    case 'aadhaar':
      return trimmed.replace(/\D/g, '');
    case 'driving_license':
      return trimmed.replace(/[\s-]/g, '').toUpperCase();
    case 'passport':
      return trimmed.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    case 'pan':
      return trimmed.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    default:
      return trimmed;
  }
}

export function validateDocumentNumber(type: IdentityDocumentType, value: string): DocumentValidationResult {
  const trimmed = String(value || '').trim();

  if (!trimmed) {
    return { isValid: null, message: '', normalizedValue: '' };
  }

  switch (type) {
    case 'aadhaar': {
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length === 12) {
        return { isValid: true, message: '✓ Valid Aadhaar Number', normalizedValue: digits };
      }
      return { isValid: false, message: '⚠ Aadhaar number must contain exactly 12 digits.', normalizedValue: digits };
    }
    case 'driving_license': {
      const normalized = trimmed.replace(/[\s-]/g, '').toUpperCase();
      if (/^[A-Z]{2}\d{2}\d{7,12}$/.test(normalized)) {
        return { isValid: true, message: '✓ Valid Driving License Number', normalizedValue: normalized };
      }
      return { isValid: false, message: '⚠ Invalid Driving License format.', normalizedValue: normalized };
    }
    case 'passport': {
      const normalized = trimmed.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      if (/^[A-Z]\d{7}$/.test(normalized)) {
        return { isValid: true, message: '✓ Valid Passport Number', normalizedValue: normalized };
      }
      return { isValid: false, message: '⚠ Invalid Passport Number format.', normalizedValue: normalized };
    }
    case 'pan': {
      const normalized = trimmed.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      if (/^[A-Z]{5}\d{4}[A-Z]$/.test(normalized)) {
        return { isValid: true, message: '✓ Valid PAN Number', normalizedValue: normalized };
      }
      return { isValid: false, message: '⚠ Invalid PAN Number format.', normalizedValue: normalized };
    }
    default:
      return { isValid: null, message: '', normalizedValue: trimmed };
  }
}

export function getCountrySupportText(country: string) {
  const normalized = String(country || '').trim().toLowerCase();
  if (normalized !== 'india') {
    return null;
  }

  return [
    'Supported IDs:',
    '• Aadhaar Card',
    '• Driving License',
    '• Passport',
    '• PAN Card',
  ];
}

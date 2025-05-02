
import { ColumnType } from '@/types/column';
import { ColumnValidation, ColumnValidationError } from '@/types/column';
import { EntryValue } from '@/types/dataEntry';

export const validateEntryValue = (
  value: string,
  type: ColumnType,
  validation?: ColumnValidation
): ColumnValidationError | null => {
  // Boş dəyər yoxlaması
  if (validation?.required && !value.trim()) {
    return {
      type: 'required',
      message: validation.requiredMessage || 'Bu sütun məcburidir'
    };
  }

  // Boş dəyərsə və məcburi deyilsə, validasiya lazım deyil
  if (!value.trim() && !validation?.required) {
    return null;
  }

  // Tip əsaslı validasiya
  switch (type) {
    case 'text':
    case 'textarea':
      return validateText(value, validation);
    case 'number':
      return validateNumber(value, validation);
    case 'date':
      return validateDate(value);
    case 'select':
      return validateSelect(value, validation);
    default:
      return null;
  }
};

const validateText = (value: string, validation?: ColumnValidation): ColumnValidationError | null => {
  if (validation?.minLength && value.length < validation.minLength) {
    return {
      type: 'minLength',
      message: `Minimum ${validation.minLength} simvol olmalıdır`
    };
  }

  if (validation?.maxLength && value.length > validation.maxLength) {
    return {
      type: 'maxLength',
      message: `Maksimum ${validation.maxLength} simvol ola bilər`
    };
  }

  if (validation?.pattern) {
    const regex = new RegExp(validation.pattern);
    if (!regex.test(value)) {
      return {
        type: 'pattern',
        message: validation.patternMessage || 'Daxil etdiyiniz məlumat düzgün formada deyil'
      };
    }
  }

  if (validation?.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return {
        type: 'email',
        message: 'Düzgün email formatı daxil edin'
      };
    }
  }

  if (validation?.url) {
    try {
      new URL(value);
    } catch (_) {
      return {
        type: 'url',
        message: 'Düzgün URL formatı daxil edin'
      };
    }
  }

  return null;
};

const validateNumber = (value: string, validation?: ColumnValidation): ColumnValidationError | null => {
  if (isNaN(Number(value))) {
    return {
      type: 'number',
      message: 'Rəqəm daxil edin'
    };
  }

  if (validation?.min !== undefined && Number(value) < validation.min) {
    return {
      type: 'min',
      message: `Minimum dəyər ${validation.min} olmalıdır`
    };
  }

  if (validation?.max !== undefined && Number(value) > validation.max) {
    return {
      type: 'max',
      message: `Maksimum dəyər ${validation.max} ola bilər`
    };
  }

  return null;
};

const validateDate = (value: string): ColumnValidationError | null => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return {
      type: 'date',
      message: 'Düzgün tarix formatı daxil edin'
    };
  }

  return null;
};

const validateSelect = (value: string, validation?: ColumnValidation): ColumnValidationError | null => {
  if (validation?.inclusion && !validation.inclusion.includes(value)) {
    return {
      type: 'inclusion',
      message: 'Siyahıdan düzgün seçim edin'
    };
  }

  return null;
};

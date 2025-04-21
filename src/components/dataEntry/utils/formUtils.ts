
import { Column } from '@/types/column';
import { ColumnValidationError } from '@/types/dataEntry';

// Bir giriş qeydinin validasiyası üçün funksiya
export const validateEntry = (value: string, column: Column): ColumnValidationError[] => {
  const errors: ColumnValidationError[] = [];

  // Əgər sütun məcburidirsə və dəyər boşdursa
  if (column.is_required && isEmptyValue(value)) {
    errors.push({
      field: column.name,
      message: `${column.name} tələb olunur`,
      type: 'required',
      severity: 'error',
      columnId: column.id
    });
    return errors;
  }

  // Əgər dəyər boşdursa və məcburi deyilsə, validasiyanı keçir
  if (isEmptyValue(value) && !column.is_required) {
    return errors;
  }

  // Sütun tipinə görə validasiya
  switch (column.type) {
    case 'number':
      validateNumberField(value, column, errors);
      break;
    case 'text':
    case 'textarea':
      validateTextField(value, column, errors);
      break;
    case 'select':
      validateSelectField(value, column, errors);
      break;
    case 'date':
      validateDateField(value, column, errors);
      break;
    default:
      break;
  }

  return errors;
};

// Bütün giriş qeydlərinin validasiyası üçün funksiya
export const validateAllEntries = (
  entries: { column_id: string; value: string }[],
  columns: Column[]
): Record<string, ColumnValidationError[]> => {
  const errors: Record<string, ColumnValidationError[]> = {};

  // Hər bir giriş üçün validasiya aparaq
  entries.forEach(entry => {
    const column = columns.find(c => c.id === entry.column_id);
    if (column) {
      const entryErrors = validateEntry(entry.value, column);
      if (entryErrors.length > 0) {
        errors[column.id] = entryErrors;
      }
    }
  });

  return errors;
};

// Dəyərin boş olub olmadığını yoxla
const isEmptyValue = (value: any): boolean => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
};

// Rəqəm sahəsinin validasiyası
const validateNumberField = (value: string, column: Column, errors: ColumnValidationError[]) => {
  const numValue = parseFloat(value);

  // Dəyər rəqəm deyilsə
  if (isNaN(numValue)) {
    errors.push({
      field: column.name,
      message: `${column.name} düzgün rəqəm formatında olmalıdır`,
      type: 'format',
      severity: 'error',
      columnId: column.id
    });
    return;
  }

  const validation = column.validation || {};

  // Minimum dəyəri yoxla
  if (validation.minValue !== undefined && numValue < validation.minValue) {
    errors.push({
      field: column.name,
      message: `${column.name} minimum ${validation.minValue} olmalıdır`,
      type: 'min',
      severity: 'error',
      columnId: column.id
    });
  }

  // Maksimum dəyəri yoxla
  if (validation.maxValue !== undefined && numValue > validation.maxValue) {
    errors.push({
      field: column.name,
      message: `${column.name} maksimum ${validation.maxValue} olmalıdır`,
      type: 'max',
      severity: 'error',
      columnId: column.id
    });
  }
};

// Mətn sahəsinin validasiyası
const validateTextField = (value: string, column: Column, errors: ColumnValidationError[]) => {
  const validation = column.validation || {};

  // Minimum uzunluğu yoxla
  if (validation.minLength !== undefined && value.length < validation.minLength) {
    errors.push({
      field: column.name,
      message: `${column.name} minimum ${validation.minLength} simvol olmalıdır`,
      type: 'minLength',
      severity: 'error',
      columnId: column.id
    });
  }

  // Maksimum uzunluğu yoxla
  if (validation.maxLength !== undefined && value.length > validation.maxLength) {
    errors.push({
      field: column.name,
      message: `${column.name} maksimum ${validation.maxLength} simvol olmalıdır`,
      type: 'maxLength',
      severity: 'error',
      columnId: column.id
    });
  }

  // Pattern yoxla
  if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
    errors.push({
      field: column.name,
      message: validation.patternMessage || `${column.name} düzgün formatda deyil`,
      type: 'pattern',
      severity: 'error',
      columnId: column.id
    });
  }
};

// Seçim sahəsinin validasiyası
const validateSelectField = (value: string, column: Column, errors: ColumnValidationError[]) => {
  const options = column.options || [];
  const values = Array.isArray(options) ? options : Object.keys(options);

  // Seçilən dəyər mümkün variantlar arasında olmalıdır
  if (!values.includes(value)) {
    errors.push({
      field: column.name,
      message: `${column.name} üçün düzgün seçim edilməlidir`,
      type: 'option',
      severity: 'error',
      columnId: column.id
    });
  }
};

// Tarix sahəsinin validasiyası
const validateDateField = (value: string, column: Column, errors: ColumnValidationError[]) => {
  const date = new Date(value);
  
  // Tarix düzgün formatda olmalıdır
  if (isNaN(date.getTime())) {
    errors.push({
      field: column.name,
      message: `${column.name} düzgün tarix formatında olmalıdır`,
      type: 'format',
      severity: 'error',
      columnId: column.id
    });
    return;
  }

  const validation = column.validation || {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Minimum tarixi yoxla
  if (validation.minDate) {
    const minDate = new Date(validation.minDate);
    if (date < minDate) {
      errors.push({
        field: column.name,
        message: `${column.name} ${minDate.toLocaleDateString()} tarixindən əvvəl ola bilməz`,
        type: 'minDate',
        severity: 'error',
        columnId: column.id
      });
    }
  }

  // Maksimum tarixi yoxla
  if (validation.maxDate) {
    const maxDate = new Date(validation.maxDate);
    if (date > maxDate) {
      errors.push({
        field: column.name,
        message: `${column.name} ${maxDate.toLocaleDateString()} tarixindən sonra ola bilməz`,
        type: 'maxDate',
        severity: 'error',
        columnId: column.id
      });
    }
  }
};


import { Column, ColumnValidation } from '@/types/column';
import { DataEntry } from '@/types/dataEntry';
import { EntryValue } from '@/types/dataEntry';

// Validasiya xətalarının yoxlanılması
export const validateField = (value: any, column: Column): string | null => {
  if (!column.validation) return null;
  
  let columnValidation: ColumnValidation;
  
  // Əgər validation string formatındadırsa, parse edirik
  if (typeof column.validation === 'string') {
    try {
      columnValidation = JSON.parse(column.validation);
    } catch (e) {
      console.error('Validation parsing error:', e);
      return null;
    }
  } else {
    columnValidation = column.validation;
  }
  
  // Required check
  if (column.is_required) {
    if (
      value === null || 
      value === undefined || 
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return 'Bu sahə məcburidir';
    }
  }
  
  // Text validations
  if (typeof value === 'string') {
    // Min length
    if (columnValidation.minLength && value.length < columnValidation.minLength) {
      return `Minimum ${columnValidation.minLength} simvol olmalıdır`;
    }
    
    // Max length
    if (columnValidation.maxLength && value.length > columnValidation.maxLength) {
      return `Maksimum ${columnValidation.maxLength} simvol olmalıdır`;
    }
    
    // Pattern
    if (columnValidation.pattern) {
      const regex = new RegExp(columnValidation.pattern);
      if (!regex.test(value)) {
        return columnValidation.customError || 'Düzgün formatda deyil';
      }
    }
  }
  
  // Number validations
  if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
    const numValue = typeof value === 'string' ? Number(value) : value;
    
    // Min value
    if (columnValidation.minValue !== undefined && numValue < columnValidation.minValue) {
      return `Minimum dəyər ${columnValidation.minValue} olmalıdır`;
    }
    
    // Max value
    if (columnValidation.maxValue !== undefined && numValue > columnValidation.maxValue) {
      return `Maksimum dəyər ${columnValidation.maxValue} olmalıdır`;
    }
  }
  
  return null;
};

// Sahə tipinə görə boş dəyəri təyin edirik
export const getEmptyValueByType = (column: Column): any => {
  switch(column.type) {
    case 'checkbox':
      return [];
    case 'number':
      return null;
    case 'date':
      return null;
    case 'select':
    case 'radio':
      return '';
    default:
      return '';
  }
};

// Form dəyərlərini DataEntry obyektlərinə çevirir
export const convertEntryValuesToDataEntries = (
  values: EntryValue[],
  schoolId: string,
  userId: string
): Partial<DataEntry>[] => {
  return values.map(entry => ({
    category_id: entry.categoryId,
    column_id: entry.columnId,
    school_id: schoolId,
    value: String(entry.value),
    status: 'pending',
    created_by: userId
  }));
};

// DataEntry obyektlərini EntryValue'ya çevirir
export const convertDataEntriesToEntryValues = (entries: DataEntry[]): EntryValue[] => {
  return entries.map(entry => ({
    columnId: entry.column_id,
    categoryId: entry.category_id,
    value: entry.value
  }));
};

// Tarix formatını çevirir
export const formatDate = (date: string | Date): string => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  } catch (e) {
    console.error('Date formatting error:', e);
    return '';
  }
};


import { Column } from '@/types/column';

interface ValueEntry {
  columnId: string;
  value: any;
  categoryId?: string;
  name?: string;
}

interface ValidatedEntry extends ValueEntry {
  isValid: boolean;
  errorMessage?: string;
}

export const validateEntries = (entries: ValueEntry[], columns: Column[]): ValidatedEntry[] => {
  return entries.map(entry => {
    const column = columns.find(col => col.id === entry.columnId);
    if (!column) {
      return {
        ...entry,
        isValid: false,
        errorMessage: 'Sütun tapılmadı'
      };
    }

    // Məcburi sahə yoxlaması
    if (column.is_required && isEmpty(entry.value)) {
      return {
        ...entry,
        isValid: false,
        errorMessage: 'Bu sahə məcburidir'
      };
    }

    // Tip yoxlaması
    if (!isEmpty(entry.value)) {
      if (column.type === 'number') {
        const numValue = Number(entry.value);
        if (isNaN(numValue)) {
          return {
            ...entry,
            isValid: false,
            errorMessage: 'Ədəd daxil edin'
          };
        }

        // Min/max yoxlaması
        const validation = typeof column.validation === 'string' 
          ? JSON.parse(column.validation) 
          : column.validation;
        
        if (validation) {
          if (validation.minValue !== undefined && numValue < validation.minValue) {
            return {
              ...entry,
              isValid: false,
              errorMessage: `Minimum dəyər: ${validation.minValue}`
            };
          }
          
          if (validation.maxValue !== undefined && numValue > validation.maxValue) {
            return {
              ...entry,
              isValid: false,
              errorMessage: `Maksimum dəyər: ${validation.maxValue}`
            };
          }
        }
      }
      
      if (column.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(entry.value))) {
          return {
            ...entry,
            isValid: false,
            errorMessage: 'Düzgün email formatında daxil edin'
          };
        }
      }
      
      // Digər tiplərin yoxlanması da əlavə edilə bilər
    }

    return {
      ...entry,
      isValid: true
    };
  });
};

export const isEmpty = (value: any): boolean => {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

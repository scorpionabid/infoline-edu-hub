
import { ColumnValidationError } from '@/types/dataEntry';
import { Column, ColumnValidation } from '@/types/column';

// Sahə tipi üçün validasiyalar
export function validateField(column: Column, value: any): ColumnValidationError | null {
  // Məcburi sahə yoxlaması
  if (column.is_required && (value === null || value === undefined || value === '')) {
    return {
      message: `${column.name} sahəsi boş qala bilməz`,
      type: 'required',
      column_id: column.id,
      column_name: column.name
    };
  }

  // Əgər dəyər boşdursa və məcburi deyilsə, digər validasiyaları yoxlamırıq
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // Əgər tipə uyğun validasiya varsa
  if (column.validation) {
    const validation = column.validation as ColumnValidation;

    switch (column.type) {
      case 'number':
        // Rəqəm tipində dəyərləri yoxla
        const numValue = parseFloat(value);
        
        if (isNaN(numValue)) {
          return {
            message: `${column.name} sahəsi düzgün rəqəm formatında olmalıdır`,
            type: 'format',
            column_id: column.id,
            column_name: column.name
          };
        }
        
        if (validation.minValue !== undefined && numValue < validation.minValue) {
          return {
            message: `${column.name} sahəsi ${validation.minValue} qiymətindən böyük olmalıdır`,
            type: 'min',
            column_id: column.id,
            column_name: column.name
          };
        }
        
        if (validation.maxValue !== undefined && numValue > validation.maxValue) {
          return {
            message: `${column.name} sahəsi ${validation.maxValue} qiymətindən kiçik olmalıdır`,
            type: 'max',
            column_id: column.id,
            column_name: column.name
          };
        }
        break;
      
      case 'text':
      case 'textarea':
        // Mətn uzunluğunu yoxla
        if (validation.minLength !== undefined && value.length < validation.minLength) {
          return {
            message: `${column.name} sahəsi ən az ${validation.minLength} simvol olmalıdır`,
            type: 'minLength',
            column_id: column.id,
            column_name: column.name
          };
        }
        
        if (validation.maxLength !== undefined && value.length > validation.maxLength) {
          return {
            message: `${column.name} sahəsi ən çox ${validation.maxLength} simvol olmalıdır`,
            type: 'maxLength',
            column_id: column.id,
            column_name: column.name
          };
        }
        break;
      
      // Lazım olduqda digər tip validasiyaları da əlavə edilə bilər
    }
  }

  return null;
}

// Bütün sahələrin validasiyasını yoxlayır və xətaları qaytarır
export function validateFields(columns: Column[], values: Record<string, any>): ColumnValidationError[] {
  const errors: ColumnValidationError[] = [];
  
  for (const column of columns) {
    const value = values[column.id];
    const error = validateField(column, value);
    
    if (error) {
      errors.push(error);
    }
  }
  
  return errors;
}

// JSON verilərini stringe çevirmək və əksinə
export const safeParseJSON = <T>(jsonString: string | null | undefined, defaultValue: T): T => {
  if (!jsonString) return defaultValue;
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (err) {
    console.error('JSON parse xətası:', err);
    return defaultValue;
  }
};

export const safeStringifyJSON = (data: any): string => {
  try {
    return JSON.stringify(data);
  } catch (err) {
    console.error('JSON stringify xətası:', err);
    return '';
  }
};

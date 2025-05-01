
import { ColumnType, ColumnValidation, ColumnValidationError } from '@/types/column';

export const validateEntryValue = (
  value: string,
  type: ColumnType,
  validation?: ColumnValidation
): ColumnValidationError | null => {
  // Validasiya tələbləri yoxdursa, null qaytarırıq
  if (!validation) return null;

  // Tələb olunan sahə boşdursa
  if (validation.required && (!value || value.trim() === '')) {
    return {
      type: 'required',
      message: validation.requiredMessage || 'Bu sahə tələb olunur',
    };
  }

  // Əgər boş dəyərsə və tələb olunmursa, validasiyadan keçir
  if (!value || value.trim() === '') {
    return null;
  }

  // Tip əsaslı validasiya
  switch (type) {
    case 'number':
      // Rəqəm olub-olmadığını yoxlayırıq
      if (isNaN(Number(value))) {
        return {
          type: 'typeError',
          message: 'Dəyər rəqəm olmalıdır',
        };
      }
      
      // Min dəyər yoxlaması
      if (validation.minValue !== undefined && Number(value) < validation.minValue) {
        return {
          type: 'minValue',
          message: `Dəyər ən azı ${validation.minValue} olmalıdır`,
        };
      }
      
      // Max dəyər yoxlaması
      if (validation.maxValue !== undefined && Number(value) > validation.maxValue) {
        return {
          type: 'maxValue',
          message: `Dəyər ən çoxu ${validation.maxValue} olmalıdır`,
        };
      }
      break;
      
    case 'text':
    case 'textarea':
    case 'email':
    case 'url':
    case 'phone':
      // Min uzunluq yoxlaması
      if (validation.minLength !== undefined && value.length < validation.minLength) {
        return {
          type: 'minLength',
          message: `Mətn ən azı ${validation.minLength} simvol olmalıdır`,
        };
      }
      
      // Max uzunluq yoxlaması
      if (validation.maxLength !== undefined && value.length > validation.maxLength) {
        return {
          type: 'maxLength',
          message: `Mətn ən çoxu ${validation.maxLength} simvol olmalıdır`,
        };
      }
      
      // Pattern yoxlaması
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        return {
          type: 'pattern',
          message: validation.patternMessage || 'Dəyər düzgün formatda deyil',
        };
      }
      
      // Email validasiyası
      if (type === 'email' || validation.email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          return {
            type: 'email',
            message: 'Düzgün email formatı daxil edin',
          };
        }
      }
      
      // URL validasiyası
      if (type === 'url' || validation.url) {
        try {
          new URL(value);
        } catch {
          return {
            type: 'url',
            message: 'Düzgün URL formatı daxil edin',
          };
        }
      }
      break;
      
    case 'select':
      // Select üçün inclusion yoxlaması
      if (validation.inclusion && !validation.inclusion.includes(value)) {
        return {
          type: 'inclusion',
          message: 'Dəyər icazə verilən siyahıda olmalıdır',
        };
      }
      break;
  }
  
  // Özel validasiya
  if (validation.custom) {
    try {
      const customValidator = new Function('value', validation.custom);
      const result = customValidator(value);
      
      if (result !== true) {
        return {
          type: 'custom',
          message: validation.customMessage || 'Validasiya xətası',
        };
      }
    } catch (error) {
      console.error('Custom validasiya xətası:', error);
      return {
        type: 'customError',
        message: 'Validasiya zamanı xəta baş verdi',
      };
    }
  }
  
  // Bütün validasiyalardan keçdisə null qaytarırıq
  return null;
};

// Form sahələrini tamamlama faizini hesablayan funksiya
export const calculateCompletionPercentage = (columns: any[], values: Record<string, string>): number => {
  if (columns.length === 0) return 0;
  
  const requiredColumns = columns.filter(column => column.validation?.required);
  
  if (requiredColumns.length === 0) {
    // Məcburi sahələr yoxdursa, doldurulan sahələrin ümumi sahələrə nisbəti
    const filledFields = Object.values(values).filter(value => value && value.trim() !== '').length;
    return Math.round((filledFields / columns.length) * 100);
  } else {
    // Məcburi sahələr varsa, onların doldurulma faizi
    const filledRequiredFields = requiredColumns.filter(column => 
      values[column.id] && values[column.id].trim() !== ''
    ).length;
    
    return Math.round((filledRequiredFields / requiredColumns.length) * 100);
  }
};

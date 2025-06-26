import { ColumnValidationError, Column } from '@/types/column';

export function validateColumnValue(value: string, column: Column): ColumnValidationError[] {
  const errors: ColumnValidationError[] = [];
  
  // Məcburi sahələri yoxla
  if (column.is_required && (!value || value.trim() === '')) {
    errors.push({
      field: column.id,
      message: `${column.name} məcburidir`,
      type: 'required',
      severity: 'error'
    });
    return errors; // Dəyər boşdursa, digər yoxlamaları etmirik
  }
  
  // Əgər dəyər boşdursa və məcburi deyilsə, yoxlama etmirik
  if (!value || value.trim() === '') {
    return errors;
  }
  
  // Validasiya qaydalarını yoxla
  const validation = column.validation;
  if (!validation) return errors;
  
  switch (column.type) {
    case 'number': {
      // Ədəd olub olmadığını yoxla
      if (isNaN(Number(value))) {
        errors.push({
          field: column.id,
          message: `${column.name} bir ədəd olmalıdır`,
          type: 'type',
          severity: 'error'
        });
      } else {
        const numValue = Number(value);
        // Minimum dəyəri yoxla
        if (validation.minValue !== undefined && numValue < validation.minValue) {
          errors.push({
            field: column.id,
            message: `${column.name} minimum ${validation.minValue} olmalıdır`,
            type: 'min',
            severity: 'error'
          });
        }
        // Maksimum dəyəri yoxla
        if (validation.maxValue !== undefined && numValue > validation.maxValue) {
          errors.push({
            field: column.id,
            message: `${column.name} maksimum ${validation.maxValue} olmalıdır`,
            type: 'max',
            severity: 'error'
          });
        }
      }
      break;
    }
      
    case 'text':
    case 'textarea':
    case 'password':
    case 'richtext': {
      // Minimum uzunluğu yoxla
      if (validation.minLength !== undefined && value.length < validation.minLength) {
        errors.push({
          field: column.id,
          message: `${column.name} minimum ${validation.minLength} simvol olmalıdır`,
          type: 'minLength',
          severity: 'error'
        });
      }
      // Maksimum uzunluğu yoxla
      if (validation.maxLength !== undefined && value.length > validation.maxLength) {
        errors.push({
          field: column.id,
          message: `${column.name} maksimum ${validation.maxLength} simvol olmalıdır`,
          type: 'maxLength',
          severity: 'error'
        });
      }
      break;
    }
      
    case 'email': {
      // E-poçt formatını yoxla
      if (validation.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push({
            field: column.id,
            message: `${column.name} düzgün e-poçt formatında olmalıdır`,
            type: 'email',
            severity: 'error'
          });
        }
      }
      break;
    }
      
    case 'url': {
      // URL formatını yoxla
      if (validation.url) {
        const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (!urlRegex.test(value)) {
          errors.push({
            field: column.id,
            message: `${column.name} düzgün URL formatında olmalıdır`,
            type: 'url',
            severity: 'error'
          });
        }
      }
      break;
    }
      
    case 'phone': {
      // Telefon formatını yoxla
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(value)) {
        errors.push({
          field: column.id,
          message: `${column.name} düzgün telefon nömrəsi formatında olmalıdır`,
          type: 'phone',
          severity: 'error'
        });
      }
      break;
    }
      
    case 'date':
    case 'datetime':
    case 'time': {
      // Tarix formatını yoxla
      const dateObj = new Date(value);
      if (isNaN(dateObj.getTime())) {
        errors.push({
          field: column.id,
          message: `${column.name} düzgün tarix formatında olmalıdır`,
          type: 'date',
          severity: 'error'
        });
      }
      break;
    }
      
    case 'range': {
      // Range dəyəri yoxla
      if (isNaN(Number(value))) {
        errors.push({
          field: column.id,
          message: `${column.name} bir ədəd olmalıdır`,
          type: 'type',
          severity: 'error'
        });
      } else {
        const numValue = Number(value);
        if (validation.minValue !== undefined && numValue < validation.minValue) {
          errors.push({
            field: column.id,
            message: `${column.name} minimum ${validation.minValue} olmalıdır`,
            type: 'min',
            severity: 'error'
          });
        }
        if (validation.maxValue !== undefined && numValue > validation.maxValue) {
          errors.push({
            field: column.id,
            message: `${column.name} maksimum ${validation.maxValue} olmalıdır`,
            type: 'max',
            severity: 'error'
          });
        }
      }
      break;
    }
  }
  
  // Pattern validasiyası
  if (validation.pattern && typeof validation.pattern === 'string') {
    try {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        errors.push({
          field: column.id,
          message: validation.customMessage || `${column.name} düzgün formatda deyil`,
          type: 'pattern',
          severity: 'error'
        });
      }
    } catch (e) {
      console.error('Invalid regex pattern:', validation.pattern);
    }
  }
  
  // Inclusion və exclusion validasiyaları
  if (validation.inclusion && Array.isArray(validation.inclusion)) {
    if (!validation.inclusion.includes(value)) {
      errors.push({
        field: column.id,
        message: `${column.name} üçün qəbul edilən dəyərlərdən biri olmalıdır`,
        type: 'inclusion',
        severity: 'error'
      });
    }
  }
  
  if (validation.exclusion && Array.isArray(validation.exclusion)) {
    if (validation.exclusion.includes(value)) {
      errors.push({
        field: column.id,
        message: `${column.name} üçün qadağan edilmiş dəyərdir`,
        type: 'exclusion',
        severity: 'error'
      });
    }
  }
  
  return errors;
}

// Sütun növləri üçün ön baxış mətnini qaytarır
export function getColumnTypePreviewText(column: Column): string {
  switch (column.type) {
    case 'text': {
      return 'Mətn sahəsi';
    }
    case 'textarea': {
      return 'Çoxsətirli mətn';
    }
    case 'number': {
      return 'Ədəd sahəsi';
    }
    case 'select': {
      return 'Açılan siyahı';
    }
    case 'date': {
      return 'Tarix seçimi';
    }
    case 'checkbox': {
      return 'Çoxlu seçim';
    }
    case 'radio': {
      return 'Tək seçim';
    }
    case 'file': {
      return 'Fayl yükləmə';
    }
    case 'email': {
      return 'E-poçt sahəsi';
    }
    case 'url': {
      return 'URL sahəsi';
    }
    case 'phone': {
      return 'Telefon sahəsi';
    }
    case 'image': {
      return 'Şəkil yükləmə';
    }
    case 'range': {
      return 'Sürüşdürmə çubuğu';
    }
    case 'color': {
      return 'Rəng seçimi';
    }
    case 'password': {
      return 'Şifrə sahəsi';
    }
    case 'time': {
      return 'Vaxt seçimi';
    }
    case 'datetime': {
      return 'Tarix və vaxt';
    }
    case 'richtext': {
      return 'Formatlanmış mətn redaktoru';
    }
    default: {
      return 'Bilinməyən sahə';
    }
  }
}

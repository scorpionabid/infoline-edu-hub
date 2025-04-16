
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
    case 'number':
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
        if (validation.min !== undefined && numValue < validation.min) {
          errors.push({
            field: column.id,
            message: `${column.name} minimum ${validation.min} olmalıdır`,
            type: 'min',
            severity: 'error'
          });
        }
        // Maksimum dəyəri yoxla
        if (validation.max !== undefined && numValue > validation.max) {
          errors.push({
            field: column.id,
            message: `${column.name} maksimum ${validation.max} olmalıdır`,
            type: 'max',
            severity: 'error'
          });
        }
      }
      break;
      
    case 'text':
    case 'textarea':
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
      
    case 'email':
      // E-poçt formatını yoxla
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push({
          field: column.id,
          message: `${column.name} düzgün e-poçt formatında olmalıdır`,
          type: 'email',
          severity: 'error'
        });
      }
      break;
      
    case 'date':
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
  
  // Pattern validasiyası
  if (validation.pattern && typeof validation.pattern === 'string') {
    try {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        errors.push({
          field: column.id,
          message: `${column.name} düzgün formatda deyil`,
          type: 'pattern',
          severity: 'error'
        });
      }
    } catch (e) {
      console.error('Invalid regex pattern:', validation.pattern);
    }
  }
  
  return errors;
}

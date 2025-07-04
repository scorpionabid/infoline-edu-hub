
import { Column } from '@/types/column';

export function validateFormData(
  columns: Column[], 
  formData: Record<string, any>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  columns.forEach(column => {
    if (column.is_required) {
      const value = formData[column.id];
      if (!value || String(value).trim() === '') {
        errors[column.id] = `${column.name} is required`;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function calculateCompletionPercentage(
  columns: Column[], 
  formData: Record<string, any>
): number {
  if (columns.length === 0) return 0;
  
  const filledFields = columns.filter(column => {
    const value = formData[column.id];
    return value && String(value).trim() !== '';
  }).length;
  
  return Math.round((filledFields / columns.length) * 100);
}

export function getRequiredFieldsStatus(
  columns: Column[], 
  formData: Record<string, any>
): { completed: number; total: number; hasAll: boolean } {
  const requiredColumns = columns.filter(col => col.is_required);
  const completedRequired = requiredColumns.filter(column => {
    const value = formData[column.id];
    return value && String(value).trim() !== '';
  }).length;
  
  return {
    completed: completedRequired,
    total: requiredColumns.length,
    hasAll: completedRequired === requiredColumns.length
  };
}

const formUtils = {
  validateFormData,
  calculateCompletionPercentage,
  // getRequiredFieldsStatus
};

export default formUtils;

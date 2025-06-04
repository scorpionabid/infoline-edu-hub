
import { useMemo } from 'react';
import { Column } from '@/types/column';
import { DataEntry } from '@/types/dataEntry';

export interface ValidationRule {
  field: string;
  required: boolean;
  type?: string;
  message?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export interface UseDataEntryValidationProps {
  columns: Column[];
  entries: DataEntry[];
  formData: Record<string, any>;
}

/**
 * Data entry validation hook
 */
export function useDataEntryValidation({
  columns,
  entries,
  formData
}: UseDataEntryValidationProps) {
  
  // Validation rules from columns
  const validationRules = useMemo(() => {
    return columns.map(column => ({
      field: column.id,
      required: column.is_required || false,
      type: column.type,
      message: `${column.name} is required`
    }));
  }, [columns]);
  
  // Validate all form data
  const validationResult = useMemo((): ValidationResult => {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};
    
    validationRules.forEach(rule => {
      const value = formData[rule.field];
      
      // Check required fields
      if (rule.required && (!value || String(value).trim() === '')) {
        errors[rule.field] = rule.message || `${rule.field} is required`;
        return;
      }
      
      // Type validation
      if (value && rule.type === 'number' && isNaN(Number(value))) {
        errors[rule.field] = `${rule.field} must be a number`;
      }
      
      if (value && rule.type === 'email' && !/\S+@\S+\.\S+/.test(value)) {
        errors[rule.field] = `${rule.field} must be a valid email`;
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  }, [validationRules, formData]);
  
  // Get error for specific field
  const getFieldError = (fieldId: string): string | undefined => {
    return validationResult.errors[fieldId];
  };
  
  // Get warning for specific field
  const getFieldWarning = (fieldId: string): string | undefined => {
    return validationResult.warnings[fieldId];
  };
  
  // Check if all required fields are filled
  const hasAllRequiredFields = useMemo(() => {
    const requiredFields = validationRules.filter(rule => rule.required);
    return requiredFields.every(rule => {
      const value = formData[rule.field];
      return value && String(value).trim() !== '';
    });
  }, [validationRules, formData]);
  
  return {
    validationResult,
    validationRules,
    getFieldError,
    getFieldWarning,
    hasAllRequiredFields,
    isValid: validationResult.isValid
  };
}

export default useDataEntryValidation;

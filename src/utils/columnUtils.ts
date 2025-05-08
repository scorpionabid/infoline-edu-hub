
import { ValidationRules } from '@/types/column';

// Mock data ilə uyğunlaşdırmaq üçün adaptasiya funksiyası
export const adaptValidationRules = (rules: any): ValidationRules => {
  // Minumum ve maximum dəyərləri min və max ilə remap edirik
  return {
    required: rules?.required || false,
    min: rules?.min || rules?.minValue,
    max: rules?.max || rules?.maxValue,
    minLength: rules?.minLength,
    maxLength: rules?.maxLength,
    pattern: rules?.pattern ? String(rules.pattern) : undefined,
    email: rules?.email,
    url: rules?.url,
    numeric: rules?.numeric,
    integer: rules?.integer,
    date: rules?.date,
    custom: rules?.custom
  };
};

// Legacy data üçün: minValue -> min çevrilməsi
export const mapMinValueToMin = (rules: any): ValidationRules => {
  if (!rules) return {};
  
  const result: ValidationRules = { ...rules };
  
  if ('minValue' in rules && rules.minValue !== undefined) {
    result.min = rules.minValue;
  }
  
  if ('maxValue' in rules && rules.maxValue !== undefined) {
    result.max = rules.maxValue;
  }
  
  return result;
};

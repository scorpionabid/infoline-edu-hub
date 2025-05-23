
export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export const validateRequired = (value: any): ValidationResult => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: 'This field is required' };
  }
  return { valid: true };
};

export const validateMinMax = (value: number, min?: number, max?: number): ValidationResult => {
  if (min !== undefined && value < min) {
    return { valid: false, message: `Value must be at least ${min}` };
  }
  if (max !== undefined && value > max) {
    return { valid: false, message: `Value must be at most ${max}` };
  }
  return { valid: true };
};


export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  message?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface ColumnValidationError {
  message: string;
  type: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, ColumnValidationError[]>;
}

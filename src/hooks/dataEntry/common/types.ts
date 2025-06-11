
// Common data entry types
export interface FormFieldType {
  id: string;
  name: string;
  type: string;
  value?: any;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

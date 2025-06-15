
export type ColumnType = 
  | 'text'
  | 'number'
  | 'email'
  | 'phone'
  | 'tel'
  | 'url'
  | 'date'
  | 'time'
  | 'datetime'
  | 'datetime-local'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'image'
  | 'currency'
  | 'percentage'
  | 'boolean'
  | 'json'
  | 'password'
  | 'switch';

export interface ColumnOption {
  id?: string;
  label: string;
  value: string;
  [key: string]: string | boolean | undefined;
}

export interface ValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  numeric?: boolean;
  integer?: boolean;
  date?: boolean;
  step?: number;
  custom?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  category_id: string;
  placeholder?: string;
  help_text?: string;
  description?: string;
  is_required: boolean;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ValidationRules;
  order_index: number;
  status: string;
  created_at: string;
  updated_at: string;
  section?: string;
}

export interface ColumnFormData {
  name: string;
  type: ColumnType;
  category_id: string;
  placeholder?: string;
  help_text?: string;
  description?: string;
  is_required: boolean;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ValidationRules;
  order_index?: number;
  section?: string;
  status?: string;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id: string;
  placeholder?: string;
  help_text?: string;
  description?: string;
  is_required: boolean;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ValidationRules;
  order_index?: number;
  section?: string;
  status?: string;
}

// Helper function to safely parse JSON fields from database
export const parseColumnOptions = (options: any): ColumnOption[] => {
  if (!options) return [];
  if (Array.isArray(options)) return options;
  if (typeof options === 'string') {
    try {
      const parsed = JSON.parse(options);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const parseValidationRules = (validation: any): ValidationRules => {
  if (!validation) return {};
  if (typeof validation === 'object' && !Array.isArray(validation)) return validation;
  if (typeof validation === 'string') {
    try {
      const parsed = JSON.parse(validation);
      return typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
};

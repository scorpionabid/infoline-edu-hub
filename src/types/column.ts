
import { Category } from './category';

export type ColumnStatus = 'active' | 'inactive' | 'deleted';

export type ColumnType = 'text' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'multiselect' | 'textarea' | 'file' | 'boolean' | 'url' | 'tel' | 'checkbox' | 'radio' | 'datetime-local' | 'time' | 'password' | 'switch' | 'json';

export interface ColumnFormData {
  name: string;
  type: ColumnType;
  category_id: string;
  is_required?: boolean;
  help_text?: string;
  description?: string;
  placeholder?: string;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  order_index?: number;
  status?: ColumnStatus;
  section?: string;
}

export interface ColumnFormValues extends ColumnFormData {
  // Additional form-specific properties
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  help_text?: string;
  description?: string;
  placeholder?: string;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  order_index?: number;
  category_id: string;
  status: ColumnStatus;
  created_at: string;
  updated_at: string;
  category?: Category;
  section?: string;
}

export interface ColumnOption {
  id?: string;
  label: string;
  value: string;
}

export interface ColumnValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  email?: boolean;
}

// Export ValidationRules as alias for ColumnValidation
export type ValidationRules = ColumnValidation;

// Utility functions for parsing
export const parseColumnOptions = (options: any): ColumnOption[] => {
  if (!options) return [];
  if (typeof options === 'string') {
    try {
      return JSON.parse(options);
    } catch {
      return [];
    }
  }
  if (Array.isArray(options)) return options;
  return [];
};

export const parseValidationRules = (validation: any): ColumnValidation => {
  if (!validation) return {};
  if (typeof validation === 'string') {
    try {
      return JSON.parse(validation);
    } catch {
      return {};
    }
  }
  if (typeof validation === 'object') return validation;
  return {};
};

export interface ColumnsContainerProps {
  columns: Column[];
  isLoading: boolean;
  error: string | null;
  onColumnCreate: (columnData: ColumnFormData) => Promise<void>;
  onColumnUpdate: (columnId: string, columnData: Partial<ColumnFormData>) => Promise<void>;
  onColumnDelete: (columnId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

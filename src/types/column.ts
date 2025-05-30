
export interface ColumnOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface ColumnValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
  minLength?: number;
  maxLength?: number;
}

export interface Column {
  id: string;
  name: string;
  type: 'text' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'radio' | 'checkbox' | 'textarea';
  category_id: string;
  order_index?: number;
  is_required?: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

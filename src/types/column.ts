
export interface Column {
  id: string;
  category_id?: string;
  name: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'radio' | 'date' | 'file' | 'image';
  placeholder?: string;
  help_text?: string;
  is_required?: boolean;
  default_value?: string;
  options?: ColumnOption[] | Record<string, any>;
  validation?: ValidationRules;
  order_index?: number;
  status?: 'active' | 'inactive' | 'deleted';
  created_at?: string;
  updated_at?: string;
}

export interface ColumnOption {
  label: string;
  value: string;
}

export interface ValidationRules {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  step?: number;
  minDate?: string;
  maxDate?: string;
}

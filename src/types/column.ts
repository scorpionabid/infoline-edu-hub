
export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'time' | 'phone' | 'color' | 'checkbox' | 'radio' | 'select' | 'textarea' | 'image' | 'file' | 'password' | 'range' | 'datetime' | 'richtext';
  is_required: boolean;
  placeholder?: string; // Placeholder əlavə edildi
  help_text?: string; // Help text əlavə edildi
  order_index?: number; // Order index əlavə edildi
  status: 'active' | 'inactive' | 'draft';
  validation?: ValidationRules;
  default_value?: string; // Default value əlavə edildi
  options?: ColumnOption[];
  created_at: string;
  updated_at: string;
  section?: string; // Section əlavə edildi
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  assignment: string;
  status: string;
  deadline?: string;
  created_at: string;
  updated_at: string;
  columns: Column[];
}

export interface ColumnOption {
  value: string;
  label: string;
}

export interface ValidationRules {
  min?: number;
  max?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  tel?: boolean;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minDate?: string;
  maxDate?: string;
}

export interface ColumnFormValues {
  name: string;
  type: Column['type'];
  is_required: boolean;
  placeholder: string;
  help_text: string;
  status: 'active' | 'inactive' | 'draft';
  order_index: number;
  default_value: string;
  options: ColumnOption[];
  validation: {
    min: string;
    max: string;
    minLength: string;
    maxLength: string;
    pattern: string;
    email: boolean;
    url: boolean;
    tel: boolean;
    minDate: string;
    maxDate: string;
  };
}

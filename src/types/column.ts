
export type ColumnType = 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'email' | 'phone' | 'tel' | 'url' | 'password' | 'datetime-local' | 'time' | 'radio' | 'switch' | 'file' | 'boolean' | 'json';

export interface ColumnOption {
  id?: string;
  label: string;
  value: string;
  [key: string]: string | undefined;
}

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  description?: string;
  order_index: number;
  status: string;
  validation?: any;
  default_value?: string;
  options?: ColumnOption[];
  created_at: string;
  updated_at: string;
  section?: string;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  description?: string;
  default_value?: string;
  options?: ColumnOption[];
  validation?: any;
  order_index: number;
  status: string;
}

export interface ColumnFormData {
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  description?: string;
  default_value?: string;
  options?: ColumnOption[];
  validation?: any;
  order_index: number;
  status: string;
}

export interface UseColumnFormProps {
  column?: Column;
  categoryId: string;
  onSuccess: () => void;
}

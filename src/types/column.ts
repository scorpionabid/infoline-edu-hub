
export type ColumnType = 
  | 'text' 
  | 'number' 
  | 'email' 
  | 'tel' 
  | 'url' 
  | 'date' 
  | 'datetime-local' 
  | 'time'
  | 'textarea' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'file'
  | 'boolean'
  | 'json';

export interface ColumnOption {
  value: string;
  label: string;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  category_id: string;
  placeholder?: string;
  help_text?: string;
  is_required: boolean;
  default_value?: string;
  options?: ColumnOption[];
  validation?: any;
  order_index: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id: string;
  placeholder?: string;
  help_text?: string;
  is_required: boolean;
  default_value?: string;
  options?: ColumnOption[];
  validation?: any;
  order_index?: number;
  status?: 'active' | 'inactive';
}

export interface UseColumnFormProps {
  column?: Column;
  categoryId: string;
  onSuccess: () => void;
}

export interface ColumnTypeSelectorProps {
  control: any;
  selectedType: ColumnType;
  onTypeChange: (type: ColumnType) => void;
}

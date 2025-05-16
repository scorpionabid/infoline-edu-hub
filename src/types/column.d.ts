
export interface Column {
  id: string;
  name: string;
  type: string;
  category_id?: string;
  options?: any[] | Record<string, any>;
  placeholder?: string;
  help_text?: string;
  is_required?: boolean;
  validation?: Record<string, any>;
  default_value?: string;
  order_index?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  section?: string;
  description?: string;
  color?: string;
}

export interface ColumnOption {
  value: string;
  label: string;
  color?: string;
  description?: string;
}

export interface BasicColumnFieldsProps {
  form?: any;
  control: any;
  register?: any;
  errors?: Record<string, any>;
  isSubmitting?: boolean;
  isEditMode: boolean;
  categories: any[];
  columns?: any[];
  editColumn?: Column;
  selectedType: ColumnType;
  onTypeChange: (type: ColumnType) => void;
}

export type ColumnType = 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'date' | 'file' | 'radio';

export interface ColumnTypeInfo {
  icon: any;
  label: string;
  description: string;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  help_text?: string;
  placeholder?: string;
  options?: ColumnOption[];
  default_value?: string;
  order_index?: number;
  validation?: Record<string, any>;
  section?: string;
}

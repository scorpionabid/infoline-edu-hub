import { Category } from './category';

export type ColumnStatus = 'active' | 'inactive';

export type ColumnType = 'text' | 'number' | 'email' | 'phone' | 'date' | 'select' | 'multiselect' | 'textarea' | 'file' | 'boolean' | 'url';

export interface ColumnFormData {
  name: string;
  type: ColumnType;
  is_required?: boolean;
  help_text?: string;
  placeholder?: string;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  order_index?: number;
  status?: ColumnStatus;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  help_text?: string;
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
  pattern?: string;
  email?: boolean;
}

export interface ColumnsContainerProps {
  columns: Column[];
  isLoading: boolean;
  error: string | null;
  onColumnCreate: (columnData: ColumnFormData) => Promise<void>;
  onColumnUpdate: (columnId: string, columnData: Partial<ColumnFormData>) => Promise<void>;
  onColumnDelete: (columnId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

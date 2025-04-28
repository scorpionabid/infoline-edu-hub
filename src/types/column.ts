
export type ColumnType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'email' | 'phone' | 'file' | 'image';

export interface ColumnValidation {
  type: string;
  value: any;
  message: string;
}

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  description?: string;
  is_required: boolean;
  order_index: number;
  options?: string[];
  validation?: ColumnValidation[];
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface ColumnValidationError {
  columnId: string;
  columnName: string;
  type: string;
  message: string;
}

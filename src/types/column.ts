
export type ColumnType = 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'email' | 'phone';

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  order_index: number;
  status: string;
  validation?: any;
  default_value?: string;
  options?: any;
  created_at: string;
  updated_at: string;
}

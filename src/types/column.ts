
export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  order_index: number;
  status: 'active' | 'inactive' | 'draft';
  validation?: any;
  default_value?: string;
  options?: any;
  created_at: string;
  updated_at: string;
}

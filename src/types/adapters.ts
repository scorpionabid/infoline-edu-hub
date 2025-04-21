
import { Column } from './column';

export interface ColumnFormData {
  name: string;
  type: string;
  category_id: string;
  is_required?: boolean;
  help_text?: string;
  placeholder?: string;
  order_index?: number;
  validation?: Record<string, any>;
  options?: any[];
  default_value?: string;
}

export interface DataEntryForm {
  id?: string;
  category_id: string;
  school_id: string;
  status: string;
  entries: any[];
  created_at?: string;
  updated_at?: string;
}

export function columnAdapter(column: Column): ColumnFormData {
  return {
    name: column.name,
    type: column.type,
    category_id: column.category_id || '',
    is_required: column.is_required,
    help_text: column.help_text,
    placeholder: column.placeholder,
    order_index: column.order_index,
    validation: column.validation || {},
    options: column.options as any[],
    default_value: column.default_value
  };
}


import { Json } from './json';

export interface ValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  numeric?: boolean;
  integer?: boolean;
  date?: boolean;
  custom?: string;
}

export interface ColumnOptions {
  choices?: string[];
  multiple?: boolean;
  other?: boolean;
  defaultValue?: string | string[];
}

export interface Column {
  id: string;
  name: string;
  category_id: string;
  type: string;
  is_required: boolean;
  order_index: number;
  help_text?: string;
  placeholder?: string;
  default_value?: string;
  options?: Json;
  validation?: Json;
  status?: string;
  created_at: string;
  updated_at: string;
  parent_column_id?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  priority?: number;
  status?: string;
  created_at: string;
  updated_at: string;
  assignment?: string;
  column_count?: number;
  archived?: boolean;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
}

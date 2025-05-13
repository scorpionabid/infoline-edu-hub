
import { Json } from '@/types/supabase';

export interface ColumnOption {
  value: string;
  label: string;
  color?: string;
}

export interface Column {
  id: string;
  name: string;
  category_id: string;
  type: string;
  options: Json | ColumnOption[];
  is_required: boolean;
  status: string;
  order_index: number;
  placeholder: string;
  help_text: string;
  default_value: string;
  validation: Json;
  created_at: string;
  updated_at: string;
  description?: string;
  color?: string;
}

export interface ColumnFormData {
  name: string;
  type: string;
  options?: ColumnOption[];
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  validation?: Record<string, any>;
  description?: string;
  color?: string;
}

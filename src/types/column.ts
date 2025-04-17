
import { Json } from '@/integrations/supabase/types';

export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'file' | 'image';

export type ColumnStatus = 'active' | 'inactive' | 'archived';

export interface ColumnOption {
  id: string;
  label: string;
  value: string;
}

export interface ColumnValidation {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  email?: boolean;
  pattern?: string;
  required?: boolean;
}

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder: string | null;
  help_text: string | null;
  order_index: number;
  status: ColumnStatus;
  validation: any; // Validasiya qaydaları
  default_value: string | null;
  options: ColumnOption[] | null;
  created_at: string;
  updated_at: string;
  parent_column_id?: string;
}

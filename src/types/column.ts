
import { Json } from "./supabase";

export type ColumnType = 
  | "text" 
  | "number" 
  | "email" 
  | "phone" 
  | "date" 
  | "select" 
  | "multiselect"
  | "checkbox"
  | "radio";

export interface ColumnOption {
  value: string;
  label: string;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  categoryId: string;
  isRequired: boolean;
  placeholder?: string;
  helpText?: string; 
  defaultValue?: string;
  orderIndex?: number;
  options?: string[] | ColumnOption[];
  validation?: ColumnValidation;
  status?: string;
  order: number; // əlavə edildi
  // Supabase uyğunluğu üçün
  category_id?: string;
  is_required?: boolean;
  default_value?: string;
  help_text?: string;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ColumnValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  min?: number;
  max?: number;
  warningThreshold?: {
    min?: number;
    max?: number;
  };
  options?: string[] | ColumnOption[];
  required?: boolean;
}


import { Json } from './supabase';

export interface Column {
  id: string;
  name: string;
  type: string;
  category_id: string;
  help_text?: string;
  placeholder?: string;
  is_required: boolean;
  options?: any;
  validation?: any;
  default_value?: string;
  status?: string;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
  section?: string;
  description?: string;
  color?: string;
}

export interface BasicColumnFieldsProps {
  form: any;
  errors: any;
  register: any;
}

export interface ColumnTypeOption {
  value: string;
  label: string;
  icon: any;
  description: string;
}

export interface ColumnOption {
  value: string;
  label: string;
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
}

export interface ColumnValidation {
  rules: ValidationRules;
  message?: string;
}

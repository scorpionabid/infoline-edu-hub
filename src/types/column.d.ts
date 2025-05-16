
export interface Column {
  id: string;
  name: string;
  type: string;
  category_id?: string;
  options?: any[] | Record<string, any>;
  placeholder?: string;
  help_text?: string;
  is_required?: boolean;
  validation?: Record<string, any>;
  default_value?: string;
  order_index?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  section?: string; // Added missing section property
}

export interface ColumnOption {
  value: string;
  label: string;
  color?: string; // Added missing color property
  description?: string; // Added missing description property
}

export interface BasicColumnFieldsProps {
  form: any;
  control: any;
  register: any;
  errors: Record<string, any>;
  isSubmitting: boolean;
  isEditMode: boolean;
}

export type ColumnType = 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'date' | 'file' | 'radio';

export interface ColumnTypeInfo {
  icon: any;
  label: string;
  description: string;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  help_text?: string;
  placeholder?: string;
  options?: ColumnOption[];
  default_value?: string;
  order_index?: number;
  validation?: Record<string, any>;
  section?: string;
}

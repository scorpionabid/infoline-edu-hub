
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
  errors?: any;
  register?: any;
  control: any;
  categories: any[];
  columns?: Column[];
  editColumn?: Column;
  selectedType: ColumnType;
  onTypeChange: (type: ColumnType) => void;
  isEditMode: boolean;
}

export type ColumnType = 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'date' | 'file' | 'radio';

export interface ColumnTypeOption {
  value: string;
  label: string;
  icon: any;
  description: string;
}

export interface ColumnOption {
  value: string;
  label: string;
  color?: string;
  description?: string;
  id?: string;
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
  description?: string;
}

export const columnTypes: Record<ColumnType, ColumnTypeInfo> = {
  text: {
    icon: 'TextIcon',
    label: 'Text',
    description: 'Short text like a title, name, or single line input'
  },
  textarea: {
    icon: 'AlignLeft',
    label: 'Textarea',
    description: 'Multi-line text for descriptions or longer content'
  },
  number: {
    icon: 'Hash',
    label: 'Number',
    description: 'Numeric input for quantities, measurements, etc.'
  },
  select: {
    icon: 'ListFilter',
    label: 'Select',
    description: 'Choose from predefined options in dropdown'
  },
  checkbox: {
    icon: 'Check',
    label: 'Checkbox',
    description: 'For yes/no selections and multiple choices'
  },
  date: {
    icon: 'Calendar',
    label: 'Date',
    description: 'For selecting dates'
  },
  file: {
    icon: 'Upload',
    label: 'File',
    description: 'For uploading documents and images'
  },
  radio: {
    icon: 'CircleDot',
    label: 'Radio',
    description: 'For selecting one option from several choices'
  }
};

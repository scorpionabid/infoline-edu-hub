import { Json } from '@/types/supabase';
import { Category } from './category';

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  options?: Record<string, any> | ColumnOption[];
  validation?: Record<string, any>;
  order_index: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ColumnOption {
  label: string;
  value: string;
}

export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'file' | 'image';

export interface ColumnValidation {
  min?: number;
  max?: number;
  required?: boolean;
  pattern?: string;
  customMessage?: string;
}

export interface ColumnWithCategory extends Column {
  category: Category;
}

export interface ColumnFormData {
  id?: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  order_index?: number;
  status?: string;
}

// Sütun tipləri üçün təriflər və konfiqurasiyalar
export const COLUMN_TYPE_DEFINITIONS = {
  text: {
    label: 'Text',
    icon: 'TextIcon',
    validations: ['required', 'minLength', 'maxLength', 'pattern']
  },
  number: {
    label: 'Number',
    icon: 'HashIcon',
    validations: ['required', 'min', 'max']
  },
  date: {
    label: 'Date',
    icon: 'CalendarIcon',
    validations: ['required', 'minDate', 'maxDate']
  },
  select: {
    label: 'Select',
    icon: 'ListFilterIcon',
    validations: ['required'],
    hasOptions: true
  },
  checkbox: {
    label: 'Checkbox',
    icon: 'CheckSquareIcon',
    validations: ['required']
  },
  radio: {
    label: 'Radio',
    icon: 'CircleIcon',
    validations: ['required'],
    hasOptions: true
  },
  textarea: {
    label: 'Textarea',
    icon: 'AlignLeftIcon',
    validations: ['required', 'minLength', 'maxLength']
  },
  file: {
    label: 'File',
    icon: 'FileIcon',
    validations: ['required', 'maxSize', 'fileType']
  },
  image: {
    label: 'Image',
    icon: 'ImageIcon',
    validations: ['required', 'maxSize', 'dimensions']
  }
};

// Adapterlər - verilənlər bazasından alınan dataları UI tiplərinə uyğunlaşdırmaq üçün
export const adaptSupabaseColumn = (dbColumn: any): Column => {
  return {
    id: dbColumn.id,
    category_id: dbColumn.category_id,
    name: dbColumn.name,
    type: dbColumn.type as ColumnType,
    is_required: dbColumn.is_required || false,
    placeholder: dbColumn.placeholder || '',
    help_text: dbColumn.help_text || '',
    default_value: dbColumn.default_value || '',
    options: dbColumn.options || [],
    validation: dbColumn.validation || {},
    order_index: dbColumn.order_index || 0,
    status: dbColumn.status || 'active',
    created_at: dbColumn.created_at,
    updated_at: dbColumn.updated_at
  };
};

// UI formlarından gələn dataları verilənlər bazası formatına çevirmək üçün
export const adaptColumnFormToSupabase = (formData: ColumnFormData): any => {
  return {
    category_id: formData.category_id,
    name: formData.name,
    type: formData.type,
    is_required: formData.is_required,
    placeholder: formData.placeholder || '',
    help_text: formData.help_text || '',
    default_value: formData.default_value || '',
    options: formData.options || [],
    validation: formData.validation || {},
    order_index: formData.order_index || 0,
    status: formData.status || 'active'
  };
};

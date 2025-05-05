
export type ColumnType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'image';

export interface ColumnOption {
  label: string;
  value: string;
}

export interface ColumnValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
}

export interface Column {
  id: string;
  category_id?: string;
  name: string;
  type: ColumnType;
  is_required?: boolean;
  placeholder?: string;
  help_text?: string;
  order_index?: number;
  status?: string;
  validation?: ColumnValidation;
  default_value?: string;
  options?: ColumnOption[];
  created_at?: string;
  updated_at?: string;
}

export const COLUMN_TYPE_DEFINITIONS = {
  text: {
    icon: 'TextIcon',
    label: 'Text',
    description: 'Short text like a name or title',
    validations: ['required', 'minLength', 'maxLength', 'pattern'],
  },
  textarea: {
    icon: 'AlignLeftIcon',
    label: 'Textarea',
    description: 'Longer text content',
    validations: ['required', 'minLength', 'maxLength'],
  },
  number: {
    icon: 'HashIcon',
    label: 'Number',
    description: 'Numeric values',
    validations: ['required', 'min', 'max'],
  },
  date: {
    icon: 'CalendarIcon',
    label: 'Date',
    description: 'Date picker',
    validations: ['required'],
  },
  select: {
    icon: 'ListIcon',
    label: 'Select',
    description: 'Selection from options',
    validations: ['required'],
    needsOptions: true,
  },
  checkbox: {
    icon: 'CheckSquareIcon',
    label: 'Checkbox',
    description: 'Boolean value',
    validations: ['required'],
  },
  radio: {
    icon: 'CircleDotIcon',
    label: 'Radio',
    description: 'Single selection from options',
    validations: ['required'],
    needsOptions: true,
  },
  file: {
    icon: 'FileIcon',
    label: 'File',
    description: 'File upload',
    validations: ['required'],
  },
  image: {
    icon: 'ImageIcon',
    label: 'Image',
    description: 'Image upload',
    validations: ['required'],
  },
};

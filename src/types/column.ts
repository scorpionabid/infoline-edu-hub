
export type ColumnType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'image' | 'email' | 'url' | 'phone' | 'range' | 'color' | 'password' | 'time' | 'datetime' | 'richtext';

export interface ColumnOption {
  id?: string;
  label: string;
  value: string;
  color?: string;
  disabled?: boolean;
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
  status?: 'active' | 'inactive';
  validation?: ColumnValidation;
  default_value?: string;
  options?: ColumnOption[];
  created_at?: string;
  updated_at?: string;
  section?: string; // Əlavə edildi, dataEntry/CategoryForm üçün
}

export interface ColumnTypeDefinition {
  icon: string;
  label: string;
  description: string;
  validations: string[];
  needsOptions?: boolean;
}

export interface ValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string | RegExp;
  email?: boolean;
  url?: boolean;
  numeric?: boolean;
  integer?: boolean;
  date?: boolean;
  custom?: (value: any) => boolean | string;
}

export interface ColumnValidationError {
  columnId: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface DependsOnCondition {
  columnId: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'contains' | 'startsWith' | 'endsWith';
  value: any;
}

export const COLUMN_TYPE_DEFINITIONS: Record<string, ColumnTypeDefinition> = {
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
  email: {
    icon: 'MailIcon',
    label: 'Email',
    description: 'Email address input',
    validations: ['required', 'email', 'pattern'],
  },
  url: {
    icon: 'LinkIcon',
    label: 'URL',
    description: 'URL input',
    validations: ['required', 'url', 'pattern'],
  },
  phone: {
    icon: 'PhoneIcon',
    label: 'Phone',
    description: 'Phone number input',
    validations: ['required', 'pattern'],
  },
  range: {
    icon: 'SlidersIcon',
    label: 'Range',
    description: 'Range slider',
    validations: ['required', 'min', 'max'],
  },
  color: {
    icon: 'PaletteIcon',
    label: 'Color',
    description: 'Color picker',
    validations: ['required'],
  },
  password: {
    icon: 'LockIcon',
    label: 'Password',
    description: 'Password input',
    validations: ['required', 'minLength', 'pattern'],
  },
  time: {
    icon: 'ClockIcon',
    label: 'Time',
    description: 'Time picker',
    validations: ['required'],
  },
  datetime: {
    icon: 'CalendarClockIcon',
    label: 'DateTime',
    description: 'Date and time picker',
    validations: ['required'],
  },
  richtext: {
    icon: 'FormattingIcon',
    label: 'Rich Text',
    description: 'Rich text editor',
    validations: ['required'],
  }
};

// CategoryWithColumns tipini category.ts'dən import edirik
import { Category } from './category';

export interface CategoryWithColumns extends Category {
  columns?: Column[];
  completionRate?: number;
  related?: any[]; // CategoryForm komponenti bunu istifadə edir
}

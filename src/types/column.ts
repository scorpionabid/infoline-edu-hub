
import { z } from "zod";

// Sütun tiplərinin tərifləri
export enum ColumnType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  DATE = 'date',
  DATETIME = 'datetime',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  FILE = 'file',
  IMAGE = 'image',
  EMAIL = 'email',
  PHONE = 'phone',
  URL = 'url',
  HIDDEN = 'hidden',
}

// Sütun tip tərifləri
export const COLUMN_TYPE_DEFINITIONS = {
  [ColumnType.TEXT]: {
    label: 'Text',
    validations: ['required', 'minLength', 'maxLength', 'pattern'],
    icon: 'TextIcon'
  },
  [ColumnType.TEXTAREA]: {
    label: 'Textarea',
    validations: ['required', 'minLength', 'maxLength'],
    icon: 'AlignLeftIcon'
  },
  [ColumnType.NUMBER]: {
    label: 'Number',
    validations: ['required', 'min', 'max', 'step'],
    icon: 'HashIcon'
  },
  [ColumnType.DATE]: {
    label: 'Date',
    validations: ['required', 'minDate', 'maxDate'],
    icon: 'CalendarIcon'
  },
  [ColumnType.DATETIME]: {
    label: 'Date & Time',
    validations: ['required', 'minDateTime', 'maxDateTime'],
    icon: 'ClockIcon'
  },
  [ColumnType.SELECT]: {
    label: 'Select',
    validations: ['required'],
    icon: 'ListIcon',
    requiresOptions: true,
  },
  [ColumnType.MULTISELECT]: {
    label: 'Multi Select',
    validations: ['required', 'minItems', 'maxItems'],
    icon: 'ListChecksIcon',
    requiresOptions: true,
  },
  [ColumnType.CHECKBOX]: {
    label: 'Checkbox',
    validations: ['required'],
    icon: 'CheckSquareIcon'
  },
  [ColumnType.RADIO]: {
    label: 'Radio',
    validations: ['required'],
    icon: 'CircleDotIcon',
    requiresOptions: true,
  },
  [ColumnType.FILE]: {
    label: 'File Upload',
    validations: ['required', 'maxFileSize', 'fileTypes'],
    icon: 'FileIcon'
  },
  [ColumnType.IMAGE]: {
    label: 'Image Upload',
    validations: ['required', 'maxFileSize', 'imageTypes', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight'],
    icon: 'ImageIcon'
  },
  [ColumnType.EMAIL]: {
    label: 'Email',
    validations: ['required', 'email'],
    icon: 'MailIcon'
  },
  [ColumnType.PHONE]: {
    label: 'Phone',
    validations: ['required', 'phone'],
    icon: 'PhoneIcon'
  },
  [ColumnType.URL]: {
    label: 'URL',
    validations: ['required', 'url'],
    icon: 'LinkIcon'
  },
  [ColumnType.HIDDEN]: {
    label: 'Hidden',
    validations: [],
    icon: 'EyeOffIcon'
  }
};

// Sütun seçenəyi
export interface ColumnOption {
  value: string;
  label: string;
  color?: string;
}

// Validasiya qaydaları
export interface ColumnValidation {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
  minDate?: string;
  maxDate?: string;
  minDateTime?: string;
  maxDateTime?: string;
  minItems?: number;
  maxItems?: number;
  maxFileSize?: number;
  fileTypes?: string[];
  imageTypes?: string[];
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

// Sütun 
export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: string;
  order_index?: number;
  is_required?: boolean;
  default_value?: string;
  placeholder?: string;
  help_text?: string;
  options?: ColumnOption[];
  status?: string;
  validation?: ColumnValidation;
  created_at: Date;
  updated_at: Date;
}

// Sütun və sütunları olan kateqoriya
export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  status?: string;
  assignment?: string;
  deadline?: Date;
  priority?: number;
  archived?: boolean;
  column_count?: number;
  created_at: Date;
  updated_at: Date;
  columns: Column[];
}

// Form etibarlılıq məlumatları
export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

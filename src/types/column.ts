// /src/types/column.ts
export type ColumnType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'file' 
  | 'image' 
  | 'email' 
  | 'url' 
  | 'phone' 
  | 'range' 
  | 'color' 
  | 'password' 
  | 'time' 
  | 'datetime' 
  | 'richtext';

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

export const columnTypes = {
  text: {
    icon: 'TextIcon',
    label: 'Text',
    description: 'Single line text input',
    validations: ['required', 'minLength', 'maxLength', 'pattern'],
  },
  textarea: {
    icon: 'TextareaIcon',
    label: 'Textarea',
    description: 'Multi-line text input',
    validations: ['required', 'minLength', 'maxLength'],
  },
  number: {
    icon: 'NumberIcon',
    label: 'Number',
    description: 'Numeric input field',
    validations: ['required', 'min', 'max'],
  },
  date: {
    icon: 'CalendarIcon',
    label: 'Date',
    description: 'Date picker',
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

// Əsas interfeyslər
export interface Category {
  id: string;
  name: string;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
  completionRate?: number;
  related?: any[];
}

export interface Column {
  id: string;
  name: string;
  title: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  status: 'active' | 'inactive' | 'draft';
  options?: ColumnOption[];
  validations?: ColumnValidation;
  // Digər xüsusiyyətlər
}
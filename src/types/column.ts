
import { Json } from './json';

// Basic column types that are supported
export type ColumnType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'date' 
  | 'time'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'email'
  | 'phone'
  | 'url'
  | 'password'
  | 'color'
  | 'file'
  | 'image'
  | 'richtext'
  | 'range';

// Type definition for column validation rules
export interface ColumnValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  [key: string]: any; // Allow additional validation rules
}

// Options for select, radio, etc.
export interface ColumnOption {
  id?: string;
  label: string;
  value: string;
  [key: string]: string | undefined; // Add index signature for Json compatibility
}

// Main column interface
export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required?: boolean;
  placeholder?: string;
  help_text?: string;
  order_index?: number;
  status?: string;
  validation?: ColumnValidation;
  options?: ColumnOption[];
  default_value?: string;
  parent_column_id?: string;
  created_at?: string;
  updated_at?: string;
  description?: string; // Added missing field
  section?: string; // Added missing field
  color?: string; // Added missing field
  version?: number; // Added for versioning support
}

// Form values for creating/editing columns
export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id: string;
  is_required?: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  validation?: ColumnValidation;
  options?: ColumnOption[];
  order_index?: number;
  description?: string;
  section?: string;
  color?: string;
}

// Column with complete definition (including type-specific information)
export interface ColumnTypeDefinition {
  value: ColumnType;
  label: string;
  icon?: string;
  description: string;
  supportsOptions?: boolean;
  supportsValidation?: boolean;
}

// Props for column type selector component
export interface ColumnTypeSelectorProps {
  value?: ColumnType;
  onChange: (value: ColumnType) => void;
  disabled?: boolean;
}

// Props for column fields component
export interface BasicColumnFieldsProps {
  form: any;
  control: any;
  categories: { id: string; name: string }[];
  columns?: Column[];
  editColumn?: Column | null;
  selectedType: string;
  onTypeChange: (type: ColumnType) => void;
  isEditMode: boolean;
}

// Column types definition with lookup function
export const columnTypes: {
  types: ColumnTypeDefinition[];
  find: (type: string) => ColumnTypeDefinition | { label: string; description: string };
} = {
  types: [
    {
      value: 'text',
      label: 'Text',
      icon: 'text',
      description: 'Single line text input',
      supportsValidation: true
    },
    {
      value: 'textarea',
      label: 'Text Area',
      icon: 'textAlignLeft',
      description: 'Multiple line text input',
      supportsValidation: true
    },
    {
      value: 'number',
      label: 'Number',
      icon: 'hash',
      description: 'Numeric input',
      supportsValidation: true
    },
    {
      value: 'date',
      label: 'Date',
      icon: 'calendar',
      description: 'Date picker',
      supportsValidation: true
    },
    {
      value: 'time',
      label: 'Time',
      icon: 'clock',
      description: 'Time picker',
      supportsValidation: true
    },
    {
      value: 'datetime',
      label: 'Date & Time',
      icon: 'calendarClock',
      description: 'Date and time picker',
      supportsValidation: true
    },
    {
      value: 'select',
      label: 'Select',
      icon: 'listBox',
      description: 'Dropdown select',
      supportsOptions: true
    },
    {
      value: 'multiselect',
      label: 'Multi Select',
      icon: 'listBox',
      description: 'Multiple selection dropdown',
      supportsOptions: true
    },
    {
      value: 'checkbox',
      label: 'Checkbox',
      icon: 'check',
      description: 'Multiple options selection',
      supportsOptions: true
    },
    {
      value: 'radio',
      label: 'Radio',
      icon: 'circle',
      description: 'Single option selection',
      supportsOptions: true
    },
    {
      value: 'email',
      label: 'Email',
      icon: 'mail',
      description: 'Email input with validation',
      supportsValidation: true
    },
    {
      value: 'url',
      label: 'URL',
      icon: 'link',
      description: 'URL input with validation',
      supportsValidation: true
    },
    {
      value: 'phone',
      label: 'Phone',
      icon: 'phone',
      description: 'Phone number input',
      supportsValidation: true
    },
    {
      value: 'file',
      label: 'File Upload',
      icon: 'file',
      description: 'File upload field',
      supportsValidation: true
    },
    {
      value: 'image',
      label: 'Image Upload',
      icon: 'image',
      description: 'Image upload with preview',
      supportsValidation: true
    },
    {
      value: 'range',
      label: 'Range',
      icon: 'sliders',
      description: 'Range slider',
      supportsValidation: true
    },
    {
      value: 'color',
      label: 'Color',
      icon: 'palette',
      description: 'Color picker',
    },
    {
      value: 'password',
      label: 'Password',
      icon: 'lock',
      description: 'Password input with masking',
      supportsValidation: true
    },
    {
      value: 'richtext',
      label: 'Rich Text',
      icon: 'formattingTwo',
      description: 'Rich text editor',
      supportsValidation: true
    }
  ],
  
  // Helper function to find a column type by value
  find: function(type: string): ColumnTypeDefinition | { label: string; description: string } {
    const foundType = this.types.find(t => t.value === type);
    return foundType || {
      label: type || 'Unknown',
      description: 'Custom column type'
    };
  }
};

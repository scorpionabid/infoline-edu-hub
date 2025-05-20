
// Define types for columns
export interface ColumnOption {
  id: string;
  label: string;
  value: string;
  color?: string;
  disabled?: boolean;
  description?: string;
}

export interface ColumnValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  message?: string;
  patternMessage?: string;
}

export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'textarea' | 'checkbox' | 'radio' | 'file' | 'image' | 'email' | 'phone' | 'url' | 'password' | 'color' | 'range' | 'richtext' | string;

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  order_index: number;
  status?: string;
  validation?: ColumnValidation | null;
  default_value?: string;
  options?: ColumnOption[];
  created_at: string;
  updated_at: string;
  description?: string;
  color?: string;
  section?: string;
  parent_column_id?: string;
  version?: number;
}

export interface ColumnFormData {
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  validation?: ColumnValidation;
  default_value?: string;
  options?: ColumnOption[];
  description?: string;
  section?: string;
  color?: string;
}

// Interface for column form values used in components
export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  validation?: ColumnValidation;
  options?: ColumnOption[];
  default_value?: string;
  category_id: string;
  description?: string;
  section?: string;
  color?: string;
  order_index?: number;
}

// Interface for BasicColumnFields props
export interface BasicColumnFieldsProps {
  control: any;
  errors?: any;
  categories?: { id: string; name: string }[];
  isSubmitting?: boolean;
  form?: any;
  columns?: Column[];
  editColumn?: Column | null;
  selectedType?: string;
  onTypeChange?: (type: string) => void;
  isEditMode?: boolean;
}

// Column type definition with icon and description
export interface ColumnTypeDefinition {
  label: string;
  description: string;
  icon?: string;
}

// Export column types with their details for UI display
export const columnTypes = {
  text: {
    label: 'Text',
    description: 'Single-line text input',
    icon: 'text'
  },
  textarea: {
    label: 'Text Area',
    description: 'Multi-line text input',
    icon: 'textAlignLeft'
  },
  number: {
    label: 'Number',
    description: 'Numeric input field',
    icon: 'hash'
  },
  date: {
    label: 'Date',
    description: 'Date selection field',
    icon: 'calendar'
  },
  select: {
    label: 'Select',
    description: 'Dropdown selection',
    icon: 'listBox'
  },
  multiselect: {
    label: 'Multi-select',
    description: 'Multiple selection dropdown',
    icon: 'listBox'
  },
  checkbox: {
    label: 'Checkbox',
    description: 'Boolean (yes/no) input',
    icon: 'check'
  },
  radio: {
    label: 'Radio',
    description: 'Single selection from multiple options',
    icon: 'circle'
  },
  file: {
    label: 'File',
    description: 'File upload field',
    icon: 'file'
  },
  image: {
    label: 'Image',
    description: 'Image upload field',
    icon: 'image'
  },
  email: {
    label: 'Email',
    description: 'Email address input',
    icon: 'mail'
  },
  url: {
    label: 'URL',
    description: 'Web address input',
    icon: 'link'
  },
  phone: {
    label: 'Phone',
    description: 'Phone number input',
    icon: 'phone'
  },
  range: {
    label: 'Range',
    description: 'Slider for selecting a range value',
    icon: 'sliders'
  },
  color: {
    label: 'Color',
    description: 'Color picker field',
    icon: 'palette'
  },
  password: {
    label: 'Password',
    description: 'Secure password input',
    icon: 'lock'
  },
  time: {
    label: 'Time',
    description: 'Time selection field',
    icon: 'clock'
  },
  datetime: {
    label: 'Date & Time',
    description: 'Date and time selection field',
    icon: 'calendarClock'
  },
  richtext: {
    label: 'Rich Text',
    description: 'Formatted text editor',
    icon: 'formattingTwo'
  },
  
  // Helper function to find a column type by name
  find: function(type: string): ColumnTypeDefinition {
    return (this[type as keyof typeof this] as ColumnTypeDefinition) || {
      label: type,
      description: 'Custom field type',
      icon: 'edit'
    };
  }
};

// Type definition for column validation rules
export interface ValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  numeric?: boolean;
  integer?: boolean;
  date?: boolean;
  custom?: string;
}

// Interface for column type selector component
export interface ColumnTypeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

// Types for Report chart types
export enum ReportTypeValues {
  BAR = 'BAR',
  PIE = 'PIE',
  LINE = 'LINE',
  TABLE = 'TABLE',
  CARD = 'CARD'
}

export interface ReportChartProps {
  type: ReportTypeValues;
  data: any[];
  title?: string;
  description?: string;
}

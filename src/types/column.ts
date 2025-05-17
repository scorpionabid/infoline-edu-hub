
export type ColumnType = 
  'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 
  'date' | 'file' | 'radio' | 'email' | 'url' | 'richtext' | 
  'range' | 'datetime' | 'phone' | 'tel' | 'password';

export interface Column {
  id: string;
  name: string;
  category_id: string;
  type: ColumnType;
  is_required: boolean;
  help_text?: string;
  placeholder?: string;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  order_index: number;
  created_at: string;
  updated_at: string;
  status?: string;
  description?: string;
  section?: string;
  color?: string;
}

export interface ColumnOption {
  id: string;
  label: string;
  value: string;
  color?: string;
  description?: string;
}

export interface ColumnValidation {
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  errorMessage?: string;
  patternMessage?: string;
  min?: number; // For backward compatibility
  max?: number; // For backward compatibility
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  help_text?: string;
  placeholder?: string;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  order_index?: number;
  status?: string;
  description?: string;
  section?: string;
  color?: string;
}

export interface ColumnTypeInfo {
  label: string;
  icon?: string;
  description: string;
}

// Updated to match the actual component parameters
export interface BasicColumnFieldsProps {
  form?: any;
  control: any;
  register?: any;
  errors?: Record<string, any>;
  isSubmitting?: boolean;
  isEditMode: boolean;
  categories: any[];
  columns?: any[];
  editColumn?: Column | null;
  selectedType: ColumnType;
  onTypeChange: (type: ColumnType) => void;
}

// Updated columnTypes definition with proper type and find method
const columnTypesObj: Record<ColumnType, ColumnTypeInfo> = {
  text: { label: 'Text', description: 'Single line text input', icon: 'text' },
  textarea: { label: 'Text Area', description: 'Multiple line text input', icon: 'textAlignLeft' },
  number: { label: 'Number', description: 'Numeric value input', icon: 'hash' },
  select: { label: 'Select', description: 'Dropdown selection', icon: 'listBox' },
  checkbox: { label: 'Checkbox', description: 'Multiple selection', icon: 'check' },
  date: { label: 'Date', description: 'Date picker', icon: 'calendar' },
  datetime: { label: 'Date & Time', description: 'Date and time picker', icon: 'calendarClock' },
  file: { label: 'File', description: 'File upload', icon: 'file' },
  radio: { label: 'Radio', description: 'Single selection', icon: 'circle' },
  email: { label: 'Email', description: 'Email address input', icon: 'mail' },
  url: { label: 'URL', description: 'URL input', icon: 'link' },
  richtext: { label: 'Rich Text', description: 'Formatted text editor', icon: 'formattingTwo' },
  range: { label: 'Range', description: 'Value within a range', icon: 'sliders' },
  phone: { label: 'Phone', description: 'Phone number input', icon: 'phone' },
  tel: { label: 'Telephone', description: 'Telephone number input', icon: 'phone' },
  password: { label: 'Password', description: 'Password input field', icon: 'lock' },
};

// Export columnTypes with find method
export const columnTypes = {
  ...columnTypesObj,
  find: function(type: string): ColumnTypeInfo | undefined {
    return columnTypesObj[type as ColumnType];
  }
};

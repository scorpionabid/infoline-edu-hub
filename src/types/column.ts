
export type ColumnType = 'text' | 'number' | 'boolean' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'email' | 'phone' | 'color' | 'tel' | 'url' | 'password' | 'range' | 'textarea' | 'multiselect' | 'richtext' | 'datetime';

export interface ColumnOption {
  id: string; // Added id property
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface ColumnValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
}

export interface Column {
  id: string;
  name: string;
  help_text?: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  status?: string;
  placeholder?: string;
  default_value?: string;
  validation?: Record<string, any>;
  order_index?: number;
  options?: ColumnOption[] | null;
  created_at: string;
  updated_at: string;
  description?: string;
}

export interface ColumnTypeMetadata {
  value: ColumnType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export interface ColumnTypeGroupMetadata {
  group: string;
  types: ColumnTypeMetadata[];
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  help_text: string;
  placeholder: string;
  default_value: string;
  options: ColumnOption[];
  validation: Record<string, any>;
  status: string;
  description: string;
  order_index: number;
}

export const COLUMN_TYPES: ColumnType[] = [
  'text',
  'number',
  'boolean',
  'date',
  'datetime',
  'select',
  'multiselect',
  'checkbox',
  'radio',
  'file',
  'email',
  'phone',
  'color',
  'tel',
  'url',
  'password',
  'range',
  'textarea',
  'richtext'
];

// Define the columnTypes object for ColumnList component
export const columnTypes: Record<string, string | { label: string; description: string; icon: string }> = {
  text: { label: 'Text', description: 'Single line text input', icon: 'text' },
  textarea: { label: 'Text Area', description: 'Multi line text input', icon: 'textAlignLeft' },
  number: { label: 'Number', description: 'Numeric input', icon: 'hash' },
  date: { label: 'Date', description: 'Date picker', icon: 'calendar' },
  datetime: { label: 'Date & Time', description: 'Date and time picker', icon: 'calendarClock' },
  select: { label: 'Select', description: 'Dropdown select', icon: 'listBox' },
  radio: { label: 'Radio', description: 'Radio button group', icon: 'circle' },
  checkbox: { label: 'Checkbox', description: 'Checkbox options', icon: 'check' },
  file: { label: 'File Upload', description: 'File upload field', icon: 'file' },
  email: { label: 'Email', description: 'Email address field', icon: 'mail' },
  url: { label: 'URL', description: 'Website URL field', icon: 'link' },
  phone: { label: 'Phone', description: 'Phone number field', icon: 'phone' },
  range: { label: 'Range', description: 'Range slider', icon: 'sliders' },
  color: { label: 'Color', description: 'Color picker', icon: 'palette' },
  password: { label: 'Password', description: 'Password input field', icon: 'lock' },
  richtext: { label: 'Rich Text', description: 'Rich text editor', icon: 'formattingTwo' }
};

// Define columnTypeDefinitions used in ColumnTypeSelector
export const columnTypeDefinitions = [
  {
    group: 'Basic',
    types: [
      { value: 'text', label: 'Text', description: 'Single line text input', icon: 'text' },
      { value: 'textarea', label: 'Text Area', description: 'Multi line text input', icon: 'textAlignLeft' },
      { value: 'number', label: 'Number', description: 'Numeric input', icon: 'hash' },
      { value: 'date', label: 'Date', description: 'Date picker', icon: 'calendar' },
      { value: 'boolean', label: 'Boolean', description: 'True/False value', icon: 'check' }
    ]
  },
  {
    group: 'Selection',
    types: [
      { value: 'select', label: 'Select', description: 'Dropdown select', icon: 'listBox' },
      { value: 'multiselect', label: 'Multi Select', description: 'Multiple selection dropdown', icon: 'listBox' },
      { value: 'radio', label: 'Radio', description: 'Radio button group', icon: 'circle' },
      { value: 'checkbox', label: 'Checkbox', description: 'Checkbox options', icon: 'check' }
    ]
  },
  {
    group: 'Special',
    types: [
      { value: 'file', label: 'File Upload', description: 'File upload field', icon: 'file' },
      { value: 'email', label: 'Email', description: 'Email address field', icon: 'mail' },
      { value: 'url', label: 'URL', description: 'Website URL field', icon: 'link' },
      { value: 'phone', label: 'Phone', description: 'Phone number field', icon: 'phone' },
      { value: 'richtext', label: 'Rich Text', description: 'Rich text editor', icon: 'formattingTwo' }
    ]
  }
];

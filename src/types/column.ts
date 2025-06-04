
// Core column types
export type ColumnType = 
  | 'text' 
  | 'number' 
  | 'email' 
  | 'tel' 
  | 'url' 
  | 'date' 
  | 'datetime-local' 
  | 'time'
  | 'textarea' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'file'
  | 'boolean'
  | 'json'
  | 'phone'
  | 'password'
  | 'switch';

export interface ColumnOption {
  id?: string;
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  [key: string]: string | boolean | undefined; // For JSON compatibility
}

export interface ColumnValidation {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url';
  value?: string | number;
  message?: string;
}

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
  custom?: any;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  category_id: string;
  placeholder?: string;
  help_text?: string;
  description?: string;
  section?: string;
  color?: string;
  is_required: boolean;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ValidationRules | any;
  order_index: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id: string;
  placeholder?: string;
  help_text?: string;
  description?: string;
  section?: string;
  color?: string;
  is_required: boolean;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ValidationRules | any;
  order_index?: number;
  status?: 'active' | 'inactive';
}

export interface UseColumnFormProps {
  column?: Column;
  categoryId: string;
  onSuccess: () => void;
}

export interface ColumnTypeSelectorProps {
  control: any;
  selectedType: ColumnType;
  onTypeChange: (type: ColumnType) => void;
}

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

// Column type definitions for UI
export const columnTypes: { value: ColumnType; label: string; description?: string }[] = [
  { value: 'text', label: 'Text', description: 'Single line text input' },
  { value: 'textarea', label: 'Textarea', description: 'Multi-line text input' },
  { value: 'number', label: 'Number', description: 'Numeric input' },
  { value: 'email', label: 'Email', description: 'Email address input' },
  { value: 'tel', label: 'Phone', description: 'Phone number input' },
  { value: 'url', label: 'URL', description: 'Website URL input' },
  { value: 'password', label: 'Password', description: 'Password input' },
  { value: 'date', label: 'Date', description: 'Date picker' },
  { value: 'datetime-local', label: 'DateTime', description: 'Date and time picker' },
  { value: 'time', label: 'Time', description: 'Time picker' },
  { value: 'select', label: 'Select', description: 'Dropdown selection' },
  { value: 'radio', label: 'Radio', description: 'Radio button group' },
  { value: 'checkbox', label: 'Checkbox', description: 'Single checkbox' },
  { value: 'switch', label: 'Switch', description: 'Toggle switch' },
  { value: 'file', label: 'File', description: 'File upload' },
  { value: 'boolean', label: 'Boolean', description: 'True/false value' },
  { value: 'json', label: 'JSON', description: 'JSON data input' }
];

// Helper function to ensure objects are JSON compatible
export function ensureJson<T>(value: T): any {
  return JSON.parse(JSON.stringify(value));
}



export type ColumnType =
  | "text"
  | "number"
  | "date"
  | "email"
  | "url"
  | "tel"
  | "select"
  | "radio"
  | "checkbox"
  | "textarea"
  | "file"
  | "location"
  | "phone"
  | "richtext"
  | "range"
  | "datetime";

export interface ColumnOption {
  id?: string;
  label: string;
  value: string;
}

export type ValidationType = "required" | "minLength" | "maxLength" | "pattern";

export interface ColumnFormValues {
  name: string;
  type: string;
  category_id: string;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  description?: string;
  section?: string;
  validation?: any;
  options?: ColumnOption[];
  order_index?: number;
}

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  order_index: number;
  status: string;
  validation?: any;
  default_value?: string;
  options?: ColumnOption[];
  created_at: string;
  updated_at: string;
  description?: string;
  section?: string;
  color?: string;
}

// Column type definitions for UI
export const columnTypeDefinitions = [
  { value: 'text', label: 'Text', icon: 'Type' },
  { value: 'number', label: 'Number', icon: 'Hash' },
  { value: 'email', label: 'Email', icon: 'Mail' },
  { value: 'tel', label: 'Phone', icon: 'Phone' },
  { value: 'url', label: 'URL', icon: 'Link' },
  { value: 'textarea', label: 'Long Text', icon: 'AlignLeft' },
  { value: 'select', label: 'Dropdown', icon: 'ChevronDown' },
  { value: 'radio', label: 'Radio', icon: 'Circle' },
  { value: 'checkbox', label: 'Checkbox', icon: 'Check' },
  { value: 'date', label: 'Date', icon: 'Calendar' },
  { value: 'file', label: 'File Upload', icon: 'Upload' },
  { value: 'location', label: 'Location', icon: 'MapPin' },
  { value: 'phone', label: 'Phone Number', icon: 'Phone' },
  { value: 'richtext', label: 'Rich Text', icon: 'FileText' },
  { value: 'range', label: 'Range', icon: 'Slider' },
  { value: 'datetime', label: 'Date Time', icon: 'Calendar' }
];

// Props interface for BasicColumnFields
export interface BasicColumnFieldsProps {
  form: any;
  data: any;
  onFormChange: (field: string, value: any) => void;
}

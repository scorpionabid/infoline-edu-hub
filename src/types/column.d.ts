
export interface Column {
  id: string;
  name: string;
  type: ColumnType | string;
  category_id?: string;
  options?: any[] | Record<string, any>;
  placeholder?: string;
  help_text?: string;
  is_required?: boolean;
  validation?: Record<string, any>;
  default_value?: string;
  order_index?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  section?: string;
  description?: string;
  color?: string;
}

export interface ColumnOption {
  value: string;
  label: string;
  color?: string;
  description?: string;
}

export interface BasicColumnFieldsProps {
  form?: any;
  control: any;
  register?: any;
  errors?: Record<string, any>;
  isSubmitting?: boolean;
  isEditMode: boolean;
  categories: any[];
  columns?: any[];
  editColumn?: Column;
  selectedType: ColumnType;
  onTypeChange: (type: ColumnType) => void;
}

export type ColumnType = 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'radio' | 'date' | 
  'datetime' | 'time' | 'file' | 'image' | 'password' | 'color' | 'range' | 'richtext' | 'phone' | 'tel' | 
  'multiselect';

export const columnTypes: Record<string, any> = {
  text: { icon: "TextIcon", label: "Text", description: "Short text input" },
  textarea: { icon: "AlignLeft", label: "Textarea", description: "Multi-line text input" },
  number: { icon: "Hash", label: "Number", description: "Numeric input" },
  select: { icon: "List", label: "Select", description: "Dropdown selection" },
  checkbox: { icon: "CheckSquare", label: "Checkbox", description: "True/false selection" },
  radio: { icon: "Circle", label: "Radio", description: "Single option selection" },
  date: { icon: "Calendar", label: "Date", description: "Date selector" },
  file: { icon: "File", label: "File", description: "File upload" },
  datetime: { icon: "Clock", label: "Date & Time", description: "Date and time selector" },
  time: { icon: "Clock", label: "Time", description: "Time selector" },
  tel: { icon: "Phone", label: "Phone", description: "Phone number input" },
  phone: { icon: "Phone", label: "Phone", description: "Phone number input" },
  multiselect: { icon: "ListChecks", label: "Multi Select", description: "Multiple options selection" }
};

export interface ColumnValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
  errorMessage?: string;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  help_text?: string;
  placeholder?: string;
  options?: ColumnOption[];
  default_value?: string;
  order_index?: number;
  validation?: Record<string, any>;
  section?: string;
}

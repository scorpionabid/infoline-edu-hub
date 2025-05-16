
export type ColumnType = 
  'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 
  'date' | 'file' | 'radio' | 'email' | 'url' | 'richtext' | 
  'range' | 'datetime' | 'phone' | 'tel';

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
}

export interface ColumnOption {
  id: string;
  label: string;
  value: string;
}

export interface ColumnValidation {
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  errorMessage?: string;
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
}

export interface ColumnTypeInfo {
  label: string;
  icon?: JSX.Element;
  description: string;
}

// Make columnTypes both a Record and have a find method by using an interface extension
export const columnTypes: Record<ColumnType, ColumnTypeInfo> & { 
  find: (type: string) => ColumnTypeInfo | undefined 
} = {
  text: { label: 'Text', description: 'Single line text input' },
  textarea: { label: 'Text Area', description: 'Multiple line text input' },
  number: { label: 'Number', description: 'Numeric value input' },
  select: { label: 'Select', description: 'Dropdown selection' },
  checkbox: { label: 'Checkbox', description: 'Multiple selection' },
  date: { label: 'Date', description: 'Date picker' },
  datetime: { label: 'Date & Time', description: 'Date and time picker' },
  file: { label: 'File', description: 'File upload' },
  radio: { label: 'Radio', description: 'Single selection' },
  email: { label: 'Email', description: 'Email address input' },
  url: { label: 'URL', description: 'URL input' },
  richtext: { label: 'Rich Text', description: 'Formatted text editor' },
  range: { label: 'Range', description: 'Value within a range' },
  phone: { label: 'Phone', description: 'Phone number input' },
  tel: { label: 'Telephone', description: 'Telephone number input' },
  
  // Add the find method
  find: function(type: string) {
    return Object.entries(this)
      .filter(([key]) => key !== 'find')
      .find(([key]) => key === type)?.[1];
  }
};

export interface BasicColumnFieldsProps {
  form: any;
  control: any;
  categories: { id: string; name: string; }[];
  columns: Column[];
  editColumn: Column;
  selectedType: ColumnType;
  onTypeChange: (type: ColumnType) => void;
  isEditMode: boolean;
}


export type ColumnType = 
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'datetime'
  | 'time'
  | 'email'
  | 'url'
  | 'phone'
  | 'file'
  | 'image'
  | 'color'
  | 'password'
  | 'richtext'
  | 'range';

export interface ColumnOption {
  id: string;
  label: string;
  value: string;
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  tel?: boolean;
  minDate?: string;
  maxDate?: string;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  order_index?: number;
  help_text?: string;
  placeholder?: string;
  default_value?: string | number | boolean;
  options?: ColumnOption[];
  validation?: ValidationRules;
  status: 'active' | 'inactive' | 'draft';
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Form tərəfindən istifadə edilən tip
export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id?: string;
  is_required: boolean;
  order_index?: number;
  help_text?: string;
  placeholder?: string;
  default_value?: string | number | boolean;
  options?: ColumnOption[];
  validation?: ValidationRules;
  status: 'active' | 'inactive' | 'draft';
  description?: string;
}

export const columnTypes: Record<ColumnType, string> = {
  text: 'Mətn',
  number: 'Rəqəm',
  textarea: 'Mətn sahəsi',
  select: 'Seçim',
  checkbox: 'Çoxlu seçim',
  radio: 'Tək seçim',
  date: 'Tarix',
  datetime: 'Tarix və saat',
  time: 'Vaxt',
  email: 'E-poçt',
  url: 'URL',
  phone: 'Telefon',
  file: 'Fayl',
  image: 'Şəkil',
  color: 'Rəng',
  password: 'Şifrə',
  richtext: 'Zəngin mətn',
  range: 'Aralıq'
};

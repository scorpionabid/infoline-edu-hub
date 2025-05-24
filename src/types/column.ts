
// Core column types
export type ColumnType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'email' 
  | 'phone' 
  | 'url'
  | 'password'
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'date' 
  | 'file'
  | 'time'
  | 'datetime'
  | 'richtext'
  | 'range';

export interface ColumnOption {
  id?: string;
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
}

export interface ColumnValidation {
  type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'minLength' | 'maxLength' | 'minValue' | 'maxValue';
  value?: string | number;
  message?: string;
}

export interface BaseColumn {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required?: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  order_index?: number;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface Column extends BaseColumn {
  options?: ColumnOption[] | any;
  validation?: ColumnValidation[] | any;
  description?: string;
  section?: string;
  color?: string;
  key?: string;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ColumnValidation[];
  order_index?: number;
  category_id?: string;
  description?: string;
  section?: string;
}

// Add ColumnFormData alias for backward compatibility
export type ColumnFormData = ColumnFormValues;

// Export column types array
export const columnTypes: ColumnType[] = [
  'text',
  'textarea', 
  'number',
  'email',
  'phone',
  'url',
  'password',
  'select',
  'checkbox',
  'radio',
  'date',
  'file',
  'time',
  'datetime',
  'richtext',
  'range'
];

// Column type definitions for UI display
export const columnTypeDefinitions = [
  { value: 'text', label: 'Mətn', description: 'Qısa mətn sahəsi', icon: '📝' },
  { value: 'textarea', label: 'Uzun mətn', description: 'Çox sətirli mətn sahəsi', icon: '📄' },
  { value: 'number', label: 'Rəqəm', description: 'Rəqəmsal dəyər', icon: '🔢' },
  { value: 'email', label: 'E-poçt', description: 'E-poçt ünvanı', icon: '📧' },
  { value: 'phone', label: 'Telefon', description: 'Telefon nömrəsi', icon: '📞' },
  { value: 'url', label: 'URL', description: 'İnternet ünvanı', icon: '🔗' },
  { value: 'password', label: 'Şifrə', description: 'Şifrə sahəsi', icon: '🔒' },
  { value: 'select', label: 'Seçim', description: 'Açılan siyahı', icon: '📋' },
  { value: 'checkbox', label: 'Çek-boks', description: 'Bəli/Xeyr seçimi', icon: '☑️' },
  { value: 'radio', label: 'Radio düymə', description: 'Tək seçim', icon: '🔘' },
  { value: 'date', label: 'Tarix', description: 'Tarix seçimi', icon: '📅' },
  { value: 'file', label: 'Fayl', description: 'Fayl yükləmə', icon: '📎' },
  { value: 'time', label: 'Vaxt', description: 'Vaxt seçimi', icon: '⏰' },
  { value: 'datetime', label: 'Tarix və Vaxt', description: 'Tarix və vaxt seçimi', icon: '📆' },
  { value: 'richtext', label: 'Formatlı mətn', description: 'Rich text editor', icon: '📝' },
  { value: 'range', label: 'Aralıq', description: 'Aralıq seçimi', icon: '📏' }
];

// Props interface for BasicColumnFields
export interface BasicColumnFieldsProps {
  control: any;
  errors: any;
  watch: any;
  categories?: any[];
  form?: any;
  columns?: Column[];
  editColumn?: Column | null;
  selectedType?: ColumnType;
  onTypeChange?: (type: ColumnType) => void;
  isEditMode?: boolean;
}

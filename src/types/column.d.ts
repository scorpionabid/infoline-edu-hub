
// Column types
export type ColumnType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'range'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'time'
  | 'datetime'
  | 'email'
  | 'url'
  | 'phone'
  | 'color'
  | 'password'
  | 'file'
  | 'image';

export interface ColumnOption {
  id: string;
  label: string;
  value: string;
}

export interface ColumnValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  minDate?: string;
  maxDate?: string;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  tel?: boolean;
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
  options: ColumnOption[];
  validation?: ColumnValidation;
  status: 'active' | 'inactive';
  description?: string;
  section?: string; // Added for CategoryForm.tsx
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  order_index?: number;
  help_text?: string;
  placeholder?: string;
  default_value?: string;
  options: ColumnOption[];
  validation?: ColumnValidation;
  status?: 'active' | 'inactive';
  description?: string;
  section?: string; // Added for CategoryForm.tsx
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  columns: Column[];
}

export interface TabDefinition {
  id: string;
  title: string;
  columns: Column[];
}

// Column type definition with icons and descriptions
export const columnTypeDefinitions = {
  text: { label: 'Mətn', description: 'Mətn sahəsi', icon: 'text' },
  number: { label: 'Rəqəm', description: 'Rəqəm sahəsi', icon: 'hash' },
  textarea: { label: 'Mətn sahəsi', description: 'Çoxsətirli mətn sahəsi', icon: 'textAlignLeft' },
  select: { label: 'Seçim', description: 'Dropdown seçim sahəsi', icon: 'listBox' },
  checkbox: { label: 'Çoxlu seçim', description: 'Birdən çox seçim etmək mümkündür', icon: 'check' },
  radio: { label: 'Tək seçim', description: 'Yalnız bir seçim etmək mümkündür', icon: 'circle' },
  date: { label: 'Tarix', description: 'Tarix seçimi', icon: 'calendar' },
  datetime: { label: 'Tarix və saat', description: 'Tarix və saat seçimi', icon: 'calendarClock' },
  time: { label: 'Vaxt', description: 'Vaxt seçimi', icon: 'clock' },
  email: { label: 'E-poçt', description: 'E-poçt sahəsi', icon: 'mail' },
  url: { label: 'URL', description: 'URL sahəsi', icon: 'link' },
  phone: { label: 'Telefon', description: 'Telefon nömrəsi sahəsi', icon: 'phone' },
  file: { label: 'Fayl', description: 'Fayl yükləmə sahəsi', icon: 'file' },
  image: { label: 'Şəkil', description: 'Şəkil yükləmə sahəsi', icon: 'image' },
  color: { label: 'Rəng', description: 'Rəng seçimi sahəsi', icon: 'palette' },
  password: { label: 'Şifrə', description: 'Şifrə sahəsi', icon: 'lock' },
  richtext: { label: 'Zəngin mətn', description: 'Formatlaşdırılmış mətn sahəsi', icon: 'formattingTwo' },
  range: { label: 'Aralıq', description: 'Aralıq seçimi sahəsi', icon: 'sliders' }
};

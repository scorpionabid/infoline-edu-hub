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
  color?: string;
  disabled?: boolean;
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
  color?: string;
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
  color?: string;
}

export const columnTypes: Record<ColumnType, string | { label: string; description: string; icon: string }> = {
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

export const columnTypeDefinitions: Record<ColumnType, ColumnTypeDefinition> = {
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

// CategoryWithColumns tipi əlavə edək
export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  status?: string;
  deadline?: string;
  columns: Column[];
  created_at?: string;
  updated_at?: string;
  assignment?: string;
}

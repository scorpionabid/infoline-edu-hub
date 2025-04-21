
import { Json } from './json';

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  order_index: number;
  placeholder?: string;
  help_text?: string;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  default_value?: any;
  status: string;
  created_at?: string;
  updated_at?: string;
  parent_column_id?: string | null;
  dependencies?: string[]; // Asılılıq olan sütun ID-ləri
  visibility_conditions?: VisibilityCondition[]; // Göstərmə şərtləri
}

export interface ColumnValidation {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customMessage?: string;
  required?: boolean;
  email?: boolean;
  url?: boolean;
  date?: boolean;
  numericality?: boolean;
  inclusion?: string[]; // Daxil edilə biləcək dəyərlər
  exclusion?: string[]; // Daxil edilə bilməyən dəyərlər
}

export type ColumnType = 'text' | 'number' | 'select' | 'date' | 'checkbox' | 'textarea' | 'radio' | 'file' | 'email' | 'url' | 'phone' | 'image' | 'range' | 'color' | 'password' | 'time' | 'datetime' | 'richtext';

export interface ColumnOption {
  label: string;
  value: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment?: 'all' | 'sectors';
  deadline?: string;
  status?: string;
  priority?: number;
  created_at?: string;
  updated_at?: string;
  column_count?: number;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
  completionPercentage?: number;
}

export interface ColumnFormData {
  name: string;
  type: ColumnType;
  is_required: boolean;
  order_index: number;
  placeholder?: string;
  help_text?: string;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  default_value?: any;
  status: 'active' | 'inactive' | 'draft';
  parent_column_id?: string;
  dependencies?: string[];
  visibility_conditions?: VisibilityCondition[];
}

export type CategoryStatus = 'active' | 'inactive' | 'draft' | 'archived';

export interface FormStatus {
  isSubmitting: boolean;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface VisibilityCondition {
  column_id: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'starts_with' | 'ends_with';
  value: string | number | boolean;
}

export interface ColumnTypeDefinition {
  icon: string;
  label: string;
  description: string;
  hasOptions: boolean;
  validations: string[];
  defaultValidation?: Partial<ColumnValidation>;
}

export const COLUMN_TYPE_DEFINITIONS: Record<ColumnType, ColumnTypeDefinition> = {
  text: {
    icon: 'text',
    label: 'Mətn',
    description: 'Qısa mətn giriş sahəsi',
    hasOptions: false,
    validations: ['minLength', 'maxLength', 'pattern', 'required'],
  },
  textarea: {
    icon: 'alignLeft',
    label: 'Mətn sahəsi',
    description: 'Çoxsətirli mətn giriş sahəsi',
    hasOptions: false,
    validations: ['minLength', 'maxLength', 'required'],
  },
  number: {
    icon: 'hash',
    label: 'Ədəd',
    description: 'Yalnız ədəd dəyəri üçün sahə',
    hasOptions: false,
    validations: ['minValue', 'maxValue', 'required'],
    defaultValidation: { numericality: true }
  },
  select: {
    icon: 'listChoice',
    label: 'Seçim listi',
    description: 'Açılan listdən seçim etmək üçün sahə',
    hasOptions: true,
    validations: ['required'],
  },
  date: {
    icon: 'calendar',
    label: 'Tarix',
    description: 'Tarix seçimi üçün sahə',
    hasOptions: false,
    validations: ['required'],
    defaultValidation: { date: true }
  },
  checkbox: {
    icon: 'check',
    label: 'Çoxlu seçim',
    description: 'Çoxlu seçim etmək üçün sahə',
    hasOptions: true,
    validations: ['required'],
  },
  radio: {
    icon: 'circleCheck',
    label: 'Radio',
    description: 'Bir seçim etmək üçün radio düymələri',
    hasOptions: true,
    validations: ['required'],
  },
  file: {
    icon: 'fileUp',
    label: 'Fayl',
    description: 'Fayl yükləmək üçün sahə',
    hasOptions: false,
    validations: ['required'],
  },
  email: {
    icon: 'mail',
    label: 'E-poçt',
    description: 'E-poçt adresi üçün sahə',
    hasOptions: false,
    validations: ['required', 'pattern'],
    defaultValidation: { email: true, pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' }
  },
  url: {
    icon: 'link',
    label: 'URL',
    description: 'Veb ünvan üçün sahə',
    hasOptions: false,
    validations: ['required', 'pattern'],
    defaultValidation: { url: true, pattern: '^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?$' }
  },
  phone: {
    icon: 'phone',
    label: 'Telefon',
    description: 'Telefon nömrəsi üçün sahə',
    hasOptions: false,
    validations: ['required', 'pattern'],
    defaultValidation: { pattern: '^\\+?[0-9]{10,15}$' }
  },
  image: {
    icon: 'image',
    label: 'Şəkil',
    description: 'Şəkil yükləmək üçün sahə',
    hasOptions: false,
    validations: ['required'],
  },
  range: {
    icon: 'sliders',
    label: 'Diapazon',
    description: 'Dəyər aralığı seçimi üçün slayder',
    hasOptions: false,
    validations: ['minValue', 'maxValue', 'required'],
  },
  color: {
    icon: 'palette',
    label: 'Rəng',
    description: 'Rəng seçimi üçün sahə',
    hasOptions: false,
    validations: ['required'],
  },
  password: {
    icon: 'lock',
    label: 'Şifrə',
    description: 'Şifrə giriş sahəsi',
    hasOptions: false,
    validations: ['minLength', 'maxLength', 'pattern', 'required'],
  },
  time: {
    icon: 'clock',
    label: 'Vaxt',
    description: 'Vaxt seçimi üçün sahə',
    hasOptions: false,
    validations: ['required'],
  },
  datetime: {
    icon: 'calendarClock',
    label: 'Tarix və vaxt',
    description: 'Tarix və vaxt seçimi üçün sahə',
    hasOptions: false,
    validations: ['required'],
  },
  richtext: {
    icon: 'fileEdit',
    label: 'Formatlanmış mətn',
    description: 'Formatlanmış mətn redaktoru',
    hasOptions: false,
    validations: ['minLength', 'maxLength', 'required'],
  }
};

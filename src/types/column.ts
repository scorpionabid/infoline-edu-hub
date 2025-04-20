
// Column tiplərini təyin edir
export type ColumnType = 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'date' | 'email' | 'url' | 'file' | 'phone' | 'image' | 'range' | 'color' | 'password' | 'time' | 'datetime' | 'richtext' | 'radio';

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
  custom?: string;
  minValue?: number;
  maxValue?: number;
  customMessage?: string;
}

export interface ColumnOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
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
  validation?: ValidationRules;
  default_value?: string;
  options?: ColumnOption[];
  created_at: string;
  updated_at: string;
  parent_column_id?: string;
  dependencies?: string[];
  visibility_conditions?: {
    column_id: string;
    operator: string;
    value: any;
  }[];
}

export interface ColumnValidation extends ValidationRules {
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  minDate?: string;
  maxDate?: string;
  inclusion?: any[];
  exclusion?: any[];
  customMessage?: string;
}

export interface ColumnFormData {
  id?: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  order_index: number;
  validation?: ColumnValidation;
  options?: ColumnOption[];
  default_value?: string;
  parent_column_id?: string;
  status: string;
  dependencies?: string[];
  visibility_conditions?: {
    column_id: string;
    operator: string;
    value: any;
  }[];
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  assignment?: string;
  deadline?: string;
  status: string;
  priority?: number;
  columns?: Column[];
  created_at: string;
  updated_at: string;
  column_count?: number;
  archived?: boolean;
}

export type ColumnStatus = 'active' | 'inactive' | 'draft';
export type CategoryStatus = 'active' | 'inactive' | 'draft';
export type FormStatus = 'pending' | 'approved' | 'rejected' | 'dueSoon' | 'overdue' | 'completed' | 'draft';

export interface ColumnValidationError {
  field: string;
  message: string;
  type: string;
  severity: 'warning' | 'error' | 'info';
  columnId?: string;
}

// Sütun tipləri üçün təriflər
export interface ColumnTypeDefinition {
  label: string;
  description: string;
  icon: string;
  validations: string[];
  defaultValidation?: Record<string, any>;
}

// Sütun tipləri definisiyaları
export const COLUMN_TYPE_DEFINITIONS: Record<ColumnType, ColumnTypeDefinition> = {
  text: {
    label: 'Mətn',
    description: 'Qısa mətnlər üçün istifadə olunur',
    icon: 'text',
    validations: ['required', 'minLength', 'maxLength', 'pattern'],
    defaultValidation: {}
  },
  textarea: {
    label: 'Çox sətirli mətn',
    description: 'Uzun mətnlər üçün istifadə olunur',
    icon: 'text',
    validations: ['required', 'minLength', 'maxLength'],
    defaultValidation: {}
  },
  number: {
    label: 'Rəqəm',
    description: 'Ədədi dəyərlər üçün istifadə olunur',
    icon: 'number',
    validations: ['required', 'minValue', 'maxValue'],
    defaultValidation: {}
  },
  select: {
    label: 'Seçim siyahısı',
    description: 'Açılan siyahıdan bir neçə seçim',
    icon: 'chevronDown',
    validations: ['required'],
    defaultValidation: {}
  },
  checkbox: {
    label: 'Çoxlu seçim',
    description: 'Bir neçə variantın seçilməsi',
    icon: 'check',
    validations: ['required'],
    defaultValidation: {}
  },
  radio: {
    label: 'Radio düymələri',
    description: 'Bir seçim etmək üçün',
    icon: 'radio',
    validations: ['required'],
    defaultValidation: {}
  },
  date: {
    label: 'Tarix',
    description: 'Tarix seçimi üçün',
    icon: 'calendar',
    validations: ['required'],
    defaultValidation: {}
  },
  email: {
    label: 'E-poçt',
    description: 'E-poçt ünvanları üçün',
    icon: 'mail',
    validations: ['required', 'email', 'pattern'],
    defaultValidation: { email: true }
  },
  url: {
    label: 'URL',
    description: 'İnternet linklər üçün',
    icon: 'link',
    validations: ['required', 'url', 'pattern'],
    defaultValidation: { url: true }
  },
  file: {
    label: 'Fayl',
    description: 'Fayl yükləmək üçün',
    icon: 'file',
    validations: ['required'],
    defaultValidation: {}
  },
  phone: {
    label: 'Telefon',
    description: 'Telefon nömrələri üçün',
    icon: 'phone',
    validations: ['required', 'pattern'],
    defaultValidation: { pattern: '^\\+?[0-9]{10,15}$' }
  },
  image: {
    label: 'Şəkil',
    description: 'Şəkil yükləmək üçün',
    icon: 'image',
    validations: ['required'],
    defaultValidation: {}
  },
  range: {
    label: 'Sürünən çubuq',
    description: 'İnterval seçimi üçün',
    icon: 'sliders',
    validations: ['required', 'minValue', 'maxValue'],
    defaultValidation: {}
  },
  color: {
    label: 'Rəng',
    description: 'Rəng seçimi üçün',
    icon: 'palette',
    validations: ['required'],
    defaultValidation: {}
  },
  password: {
    label: 'Şifrə',
    description: 'Gizli mətn daxil etmək üçün',
    icon: 'lock',
    validations: ['required', 'minLength', 'maxLength', 'pattern'],
    defaultValidation: {}
  },
  time: {
    label: 'Vaxt',
    description: 'Vaxt seçimi üçün',
    icon: 'clock',
    validations: ['required'],
    defaultValidation: {}
  },
  datetime: {
    label: 'Tarix və vaxt',
    description: 'Tarix və vaxt seçimi üçün',
    icon: 'calendar',
    validations: ['required'],
    defaultValidation: {}
  },
  richtext: {
    label: 'Zəngin mətn',
    description: 'Formatlanmış mətn redaktoru',
    icon: 'edit',
    validations: ['required', 'minLength', 'maxLength'],
    defaultValidation: {}
  }
};

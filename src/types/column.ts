
export type ColumnTypeDefinition = {
  label: string;
  description: string;
  icon: string;
  validations?: string[];
};

export const COLUMN_TYPE_DEFINITIONS: Record<string, ColumnTypeDefinition> = {
  text: {
    label: 'Mətn',
    description: 'Qısa mətn sahəsi',
    icon: 'text',
    validations: ['minLength', 'maxLength', 'pattern', 'required']
  },
  textarea: {
    label: 'Çoxsətirli mətn',
    description: 'Uzun mətn sahəsi',
    icon: 'textAlignLeft',
    validations: ['minLength', 'maxLength', 'required']
  },
  number: {
    label: 'Ədəd',
    description: 'Rəqəm daxiletmə sahəsi',
    icon: 'hash',
    validations: ['min', 'max', 'required']
  },
  date: {
    label: 'Tarix',
    description: 'Tarix seçimi',
    icon: 'calendar',
    validations: ['min', 'max', 'required']
  },
  select: {
    label: 'Seçim',
    description: 'Açılan siyahıdan seçim',
    icon: 'listBox',
    validations: ['required']
  },
  checkbox: {
    label: 'Çoxlu seçim',
    description: 'Bir və ya bir neçə variantı seçin',
    icon: 'check',
    validations: ['required']
  },
  radio: {
    label: 'Tək seçim',
    description: 'Bir variant seçin',
    icon: 'circle',
    validations: ['required']
  },
  file: {
    label: 'Fayl',
    description: 'Fayl yükləmə',
    icon: 'file',
    validations: ['required']
  },
  image: {
    label: 'Şəkil',
    description: 'Şəkil yükləmə',
    icon: 'image',
    validations: ['required']
  },
  email: {
    label: 'E-poçt',
    description: 'E-poçt ünvanı sahəsi',
    icon: 'mail',
    validations: ['pattern', 'required']
  },
  url: {
    label: 'URL',
    description: 'Veb ünvan sahəsi',
    icon: 'link',
    validations: ['pattern', 'required']
  },
  tel: {
    label: 'Telefon',
    description: 'Telefon nömrəsi',
    icon: 'phone',
    validations: ['pattern', 'required']
  },
  phone: {
    label: 'Telefon',
    description: 'Telefon nömrəsi',
    icon: 'phone',
    validations: ['pattern', 'required']
  },
  range: {
    label: 'Aralıq',
    description: 'Rəqəm aralığı',
    icon: 'sliders',
    validations: ['min', 'max', 'required']
  },
  color: {
    label: 'Rəng',
    description: 'Rəng seçimi',
    icon: 'palette',
    validations: ['required']
  },
  password: {
    label: 'Şifrə',
    description: 'Şifrə sahəsi',
    icon: 'lock',
    validations: ['minLength', 'maxLength', 'pattern', 'required']
  },
  time: {
    label: 'Vaxt',
    description: 'Vaxt seçimi',
    icon: 'clock',
    validations: ['required']
  },
  datetime: {
    label: 'Tarix və vaxt',
    description: 'Tarix və vaxt seçimi',
    icon: 'calendarClock',
    validations: ['required']
  },
  richtext: {
    label: 'Formatlanmış mətn',
    description: 'Formatlanmış mətn redaktoru',
    icon: 'formattingTwo',
    validations: ['required']
  }
};

export type ColumnType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'image'
  | 'email'
  | 'url'
  | 'tel'
  | 'phone'
  | 'range'
  | 'color'
  | 'password'
  | 'time'
  | 'datetime'
  | 'richtext';

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  description?: string;
  help_text?: string;
  placeholder?: string;
  default_value?: string;
  is_required: boolean;
  options?: ColumnOption[] | string;
  order_index: number;
  status: 'active' | 'inactive';
  validation?: ColumnValidation | string;
  created_at: string;
  updated_at: string;
  parent_column_id?: string;
  dependencies?: string[];
  visibility_conditions?: any;
  section?: string; // Bölmə sahəsini əlavə edirik
}

export interface ColumnOption {
  id: string;
  label: string;
  value: string;
  color?: string;
  disabled?: boolean;
}

export interface ColumnValidation {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customError?: string;
  type?: string;
  value?: string | number;
  message?: string;
  min?: number;
  max?: number;
}

export type ValidationRules = {
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
};

export interface ColumnValidationError {
  field: string; 
  message: string;
  type: string; 
  severity: 'warning' | 'error' | 'info';
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors';
  status: 'active' | 'inactive' | 'draft';
  priority?: number;
  deadline?: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
  columns: Column[];
  entries?: any[];
  completionPercentage?: number;
  completionRate?: number; // Əlavə edildi
  related?: boolean;
  column_count?: number;
}

export interface DependsOnCondition {
  columnId: string;
  condition: {
    type: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan';
    value: string | number;
  };
}

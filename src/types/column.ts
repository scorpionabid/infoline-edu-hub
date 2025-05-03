import { AssignmentType } from './category';

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
  | 'phone'
  | 'range'
  | 'color'
  | 'password'
  | 'time'
  | 'datetime'
  | 'richtext';

// Sütun növü haqqında əlavə məlumatları saxlayan interfeys
export interface ColumnTypeDefinition {
  label: string;
  icon: string;
  description: string;
}

// Sütun növlərinin təriflərini saxlayan obyekt
export const COLUMN_TYPE_DEFINITIONS: Record<ColumnType, ColumnTypeDefinition> = {
  text: {
    label: 'Mətn',
    icon: 'text',
    description: 'Qısa mətn daxil etmək üçün'
  },
  textarea: {
    label: 'Uzun mətn',
    icon: 'textAlignLeft',
    description: 'Çoxsətirli mətn daxil etmək üçün'
  },
  number: {
    label: 'Rəqəm',
    icon: 'hash',
    description: 'Yalnız rəqəm daxil etmək üçün'
  },
  date: {
    label: 'Tarix',
    icon: 'calendar',
    description: 'Tarix seçmək üçün'
  },
  select: {
    label: 'Aşağı açılan siyahı',
    icon: 'listBox',
    description: 'Siyahıdan bir element seçmək üçün'
  },
  checkbox: {
    label: 'Çoxlu seçim',
    icon: 'check',
    description: 'Bir neçə seçim etmək üçün'
  },
  radio: {
    label: 'Radio düymələri',
    icon: 'circle',
    description: 'Yalnız bir seçim etmək üçün'
  },
  file: {
    label: 'Fayl',
    icon: 'file',
    description: 'Fayl yükləmək üçün'
  },
  image: {
    label: 'Şəkil',
    icon: 'image',
    description: 'Şəkil yükləmək üçün'
  },
  email: {
    label: 'E-poçt',
    icon: 'mail',
    description: 'E-poçt ünvanları üçün'
  },
  url: {
    label: 'URL',
    icon: 'link',
    description: 'Veb ünvanlar üçün'
  },
  phone: {
    label: 'Telefon',
    icon: 'phone',
    description: 'Telefon nömrələri üçün'
  },
  range: {
    label: 'Diapazon',
    icon: 'sliders',
    description: 'Müəyyən bir diapazon seçmək üçün'
  },
  color: {
    label: 'Rəng',
    icon: 'palette',
    description: 'Rəng seçmək üçün'
  },
  password: {
    label: 'Şifrə',
    icon: 'lock',
    description: 'Şifrə daxil etmək üçün'
  },
  time: {
    label: 'Vaxt',
    icon: 'clock',
    description: 'Vaxt seçmək üçün'
  },
  datetime: {
    label: 'Tarix və vaxt',
    icon: 'calendarClock',
    description: 'Tarix və vaxt seçmək üçün'
  },
  richtext: {
    label: 'Zəngin mətn',
    icon: 'formattingTwo',
    description: 'Formatlaşdırılmış mətn üçün'
  }
};

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
}

// Validasiya qaydaları
export interface ValidationRules {
  required: boolean;
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
  custom?: any;
}

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  description?: string;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  is_required: boolean;
  is_visible?: boolean;
  status: 'active' | 'inactive' | 'draft';
  created_at: Date;
  updated_at: Date;
  order_index: number;
  validation?: any;
  options?: ColumnOption[];
  parent_column_id?: string;
  dependencies?: string[];
  visibility_conditions?: any;
  version?: number;
  conditional_display?: {
    column_id: string;
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=';
    value: string | number;
  };
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  assignment: AssignmentType;
  status: 'active' | 'inactive' | 'draft';
  deadline?: Date;
  created_at: Date;
  updated_at: Date;
  archived: boolean;
  priority: number;
  columns: Column[];
}

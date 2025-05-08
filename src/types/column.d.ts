
export type ColumnType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'select' 
  | 'date' 
  | 'time' 
  | 'datetime' 
  | 'email' 
  | 'phone' 
  | 'url' 
  | 'checkbox' 
  | 'radio' 
  | 'file' 
  | 'image' 
  | 'color' 
  | 'password'
  | 'richtext'
  | 'range';

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  order_index?: number;
  status: 'active' | 'inactive';
  validation?: ValidationRules;
  default_value?: string;
  options?: ColumnOption[];
  created_at?: string;
  updated_at?: string;
  deadline?: Date;
  description?: string;
}

export interface ColumnOption {
  id: string;
  label: string;
  value: string;
  color?: string;
  disabled?: boolean;
}

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
  tel?: boolean;
  minDate?: string;
  maxDate?: string;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  status: 'active' | 'inactive' | 'draft';
  order_index?: number;
  default_value?: string;
  options?: ColumnOption[];
  validation: {
    min: string;
    max: string;
    minLength: string;
    maxLength: string;
    pattern: string;
    email: boolean;
    url: boolean;
    tel: boolean;
    minDate: string;
    maxDate: string;
  };
  description?: string;
  category_id?: string;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  status: string;
  columns?: Column[];
  columnCount?: number;
  description?: string;
  assignment?: string;
  deadline?: string | Date;
  completionRate?: number;
}

export interface ColumnTypeOption {
  value: ColumnType;
  label: string;
  description: string;
  icon?: string;
}

export const columnTypeDefinitions: Record<string, { label: string; description: string; icon: string }> = {
  text: {
    label: 'Mətn',
    description: 'Qısa mətn daxil etmək üçün',
    icon: 'Text'
  },
  textarea: {
    label: 'Mətn sahəsi',
    description: 'Uzun mətn daxil etmək üçün',
    icon: 'AlignLeft'
  },
  number: {
    label: 'Rəqəm',
    description: 'Rəqəm daxil etmək üçün',
    icon: 'Hash'
  },
  range: {
    label: 'Aralıq',
    description: 'Miqdar daxil etmək üçün sürüşdürücü',
    icon: 'Sliders'
  },
  select: {
    label: 'Seçim',
    description: 'Aşağı açılan siyahından bir seçim etmək üçün',
    icon: 'List'
  },
  checkbox: {
    label: 'İşarə qutusu',
    description: 'Bir neçə seçim etmək üçün',
    icon: 'Check'
  },
  radio: {
    label: 'Radio düymə',
    description: 'Bir seçim etmək üçün',
    icon: 'Circle'
  },
  date: {
    label: 'Tarix',
    description: 'Tarix seçmək üçün',
    icon: 'Calendar'
  },
  time: {
    label: 'Vaxt',
    description: 'Vaxt seçmək üçün',
    icon: 'Clock'
  },
  datetime: {
    label: 'Tarix və vaxt',
    description: 'Tarix və vaxt seçmək üçün',
    icon: 'CalendarClock'
  },
  file: {
    label: 'Fayl',
    description: 'Fayl yükləmək üçün',
    icon: 'File'
  },
  image: {
    label: 'Şəkil',
    description: 'Şəkil yükləmək üçün',
    icon: 'Image'
  },
  email: {
    label: 'E-poçt',
    description: 'E-poçt ünvanı daxil etmək üçün',
    icon: 'Mail'
  },
  url: {
    label: 'URL',
    description: 'Veb ünvan daxil etmək üçün',
    icon: 'Link'
  },
  phone: {
    label: 'Telefon',
    description: 'Telefon nömrəsi daxil etmək üçün',
    icon: 'Phone'
  },
  color: {
    label: 'Rəng',
    description: 'Rəng seçmək üçün',
    icon: 'Palette'
  },
  password: {
    label: 'Şifrə',
    description: 'Şifrə daxil etmək üçün',
    icon: 'Lock'
  },
  richtext: {
    label: 'Zəngin mətn',
    description: 'Formatlanmış mətn daxil etmək üçün',
    icon: 'Type'
  }
};

export const columnTypes = columnTypeDefinitions;

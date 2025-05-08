
// Sütun tipləri

export const columnTypes = [
  'text',
  'number',
  'date',
  'time',
  'phone',
  'color',
  'checkbox',
  'radio',
  'select',
  'textarea',
  'image',
  'file',
  'password',
  'range',
  'datetime',
  'richtext',
  'email',
  'url'
] as const;

export type ColumnType = typeof columnTypes[number];

export interface ColumnOption {
  value: string;
  label: string;
  id?: string;
  color?: string;
}

export interface ValidationRules {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  tel?: boolean;
  minDate?: string;
  maxDate?: string;
  required?: boolean;
}

export interface ColumnValidation {
  min?: string;
  max?: string;
  minLength?: string;
  maxLength?: string;
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
  placeholder?: string;
  help_text?: string;
  status: 'active' | 'inactive' | 'draft';
  order_index: number;
  default_value?: string;
  options?: ColumnOption[];
  validation?: ValidationRules;
  created_at?: string;
  updated_at?: string;
  parent_column_id?: string;
  section?: string;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder: string;
  help_text: string;
  status: string;
  order_index: number;
  default_value: string;
  options: ColumnOption[];
  validation: ColumnValidation;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  status: string;
  deadline?: string | null;
  columns: Column[];
  completionRate?: number;
  column_count?: number;
  columnsCount?: number;
}

export interface CategoryFilter {
  status?: string;
  search?: string;
  sort?: string;
  assignment?: string;
}

export const columnTypeDefinitions: Record<ColumnType, {
  label: string;
  description: string;
  icon: string;
}> = {
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
    icon: 'FileText'
  }
};

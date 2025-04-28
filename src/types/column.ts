
export type ColumnType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'email' | 'phone' | 'file' | 'image' | 'url' | 'time' | 'password' | 'range' | 'datetime' | 'richtext' | 'color';

export interface ColumnOption {
  value: string;
  label: string;
  color?: string;
  disabled?: boolean;
}

export interface ColumnValidation {
  type: string;
  value: any;
  message: string;
}

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  description?: string;
  is_required: boolean;
  order_index: number;
  options?: string[] | ColumnOption[];
  validation?: ColumnValidation[];
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  parent_column_id?: string;
  dependencies?: string[];
  visibility_conditions?: any;
}

export interface ColumnValidationError {
  columnId: string;
  columnName: string;
  type: string;
  message: string;
}

// Sütun tiplərinin təsviri
export const COLUMN_TYPE_DEFINITIONS: Record<ColumnType, { icon: string; label: string; description: string; }> = {
  text: {
    icon: 'Type',
    label: 'Mətn',
    description: 'Qısa mətn sahəsi'
  },
  textarea: {
    icon: 'PanelLeft',
    label: 'Çoxsətirli mətn',
    description: 'Uzun mətn sahəsi'
  },
  number: {
    icon: 'Hash',
    label: 'Rəqəm',
    description: 'Rəqəm sahəsi'
  },
  date: {
    icon: 'Calendar',
    label: 'Tarix',
    description: 'Tarix seçmək üçün'
  },
  select: {
    icon: 'ListFilter',
    label: 'Seçim',
    description: 'Bir variant seçmək üçün'
  },
  multiselect: {
    icon: 'CheckSquare',
    label: 'Çoxlu seçim',
    description: 'Bir neçə variant seçmək üçün'
  },
  checkbox: {
    icon: 'CheckSquare',
    label: 'İşarə qutusu',
    description: 'Bəli/Xeyr seçimi'
  },
  radio: {
    icon: 'Circle',
    label: 'Radio düymələri',
    description: 'Radio düymələri qrupu'
  },
  email: {
    icon: 'Mail',
    label: 'E-poçt',
    description: 'E-poçt sahəsi'
  },
  phone: {
    icon: 'Phone',
    label: 'Telefon',
    description: 'Telefon nömrəsi'
  },
  file: {
    icon: 'File',
    label: 'Fayl',
    description: 'Fayl yükləmə sahəsi'
  },
  image: {
    icon: 'Image',
    label: 'Şəkil',
    description: 'Şəkil yükləmə sahəsi'
  },
  url: {
    icon: 'Link',
    label: 'URL',
    description: 'Web URL sahəsi'
  },
  time: {
    icon: 'Clock',
    label: 'Vaxt',
    description: 'Vaxt seçmə sahəsi'
  },
  password: {
    icon: 'Lock',
    label: 'Şifrə',
    description: 'Şifrə daxil etmə sahəsi'
  },
  range: {
    icon: 'Sliders',
    label: 'Aralıq',
    description: 'Aralıq seçmək üçün slayder'
  },
  datetime: {
    icon: 'CalendarClock',
    label: 'Tarix və vaxt',
    description: 'Tarix və vaxt seçimi'
  },
  richtext: {
    icon: 'FileEdit',
    label: 'Formatlaşdırılmış mətn',
    description: 'Formatlaşdırma ilə mətn redaktoru'
  },
  color: {
    icon: 'Palette',
    label: 'Rəng',
    description: 'Rəng seçimi'
  }
};

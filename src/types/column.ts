
export type ColumnType = 
  | 'text' 
  | 'number' 
  | 'select' 
  | 'multiselect'
  | 'date' 
  | 'checkbox' 
  | 'radio' 
  | 'textarea'
  | 'email'
  | 'url'
  | 'file'
  | 'image'
  | 'phone'
  | 'time'
  | 'datetime'
  | 'color'
  | 'password'
  | 'richtext'
  | 'range';

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  minValue?: number;
  maxValue?: number;
  tel?: boolean;
  minDate?: string | Date;
  maxDate?: string | Date;
}

export interface ColumnValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  minValue?: number;
  maxValue?: number;
  customMessage?: string;
  tel?: boolean;
  minDate?: string | Date;
  maxDate?: string | Date;
}

export interface ColumnOption {
  id?: string;
  label: string;
  value: string;
  color?: string;
  disabled?: boolean;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  order_index?: number;
  options?: ColumnOption[];
  validation?: ValidationRules;
  help_text?: string;
  placeholder?: string;
  default_value?: any;
  parent_column_id?: string;
  conditional_display?: any;
  status?: 'active' | 'inactive' | 'draft';
  created_at?: string;
  updated_at?: string;
  deadline?: Date;
}

export interface ColumnWithData extends Column {
  data?: any;
  value?: any;
  error?: string;
}

export interface ColumnWithOptions extends Column {
  options: ColumnOption[];
}

export interface ColumnWithValidation extends Column {
  validation: ValidationRules;
}

export interface ColumnTreeItem {
  column: Column;
  children: ColumnTreeItem[];
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

export interface ColumnFormValues {
  id?: string;
  name: string;
  category_id: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  order_index?: number;
  options?: ColumnOption[];
  validation?: ValidationRules;
  parent_column_id?: string;
  status?: string;
  default_value?: string;
}

// Sütun tipləri üçün məlumat obyekti
export const columnTypes: Record<ColumnType, {
  label: string;
  description: string;
  icon: string;
}> = {
  text: {
    label: 'Mətn',
    description: 'Qısa mətn daxil etmək üçün',
    icon: 'text'
  },
  textarea: {
    label: 'Mətn sahəsi',
    description: 'Uzun mətn daxil etmək üçün',
    icon: 'textAlignLeft'
  },
  number: {
    label: 'Rəqəm',
    description: 'Rəqəm daxil etmək üçün',
    icon: 'hash'
  },
  range: {
    label: 'Aralıq',
    description: 'Miqdar daxil etmək üçün sürüşdürücü',
    icon: 'sliders'
  },
  select: {
    label: 'Seçim',
    description: 'Aşağı açılan siyahından bir seçim etmək üçün',
    icon: 'listBox'
  },
  multiselect: {
    label: 'Çoxlu seçim',
    description: 'Aşağı açılan siyahından bir neçə seçim etmək üçün',
    icon: 'listBox'
  },
  checkbox: {
    label: 'İşarə qutusu',
    description: 'Bir neçə seçim etmək üçün',
    icon: 'check'
  },
  radio: {
    label: 'Radio düymə',
    description: 'Bir seçim etmək üçün',
    icon: 'circle'
  },
  date: {
    label: 'Tarix',
    description: 'Tarix seçmək üçün',
    icon: 'calendar'
  },
  time: {
    label: 'Vaxt',
    description: 'Vaxt seçmək üçün',
    icon: 'clock'
  },
  datetime: {
    label: 'Tarix və vaxt',
    description: 'Tarix və vaxt seçmək üçün',
    icon: 'calendarClock'
  },
  file: {
    label: 'Fayl',
    description: 'Fayl yükləmək üçün',
    icon: 'file'
  },
  image: {
    label: 'Şəkil',
    description: 'Şəkil yükləmək üçün',
    icon: 'image'
  },
  email: {
    label: 'E-poçt',
    description: 'E-poçt ünvanı daxil etmək üçün',
    icon: 'mail'
  },
  url: {
    label: 'URL',
    description: 'Veb ünvan daxil etmək üçün',
    icon: 'link'
  },
  phone: {
    label: 'Telefon',
    description: 'Telefon nömrəsi daxil etmək üçün',
    icon: 'phone'
  },
  color: {
    label: 'Rəng',
    description: 'Rəng seçmək üçün',
    icon: 'palette'
  },
  password: {
    label: 'Şifrə',
    description: 'Şifrə daxil etmək üçün',
    icon: 'lock'
  },
  richtext: {
    label: 'Zəngin mətn',
    description: 'Formatlanmış mətn daxil etmək üçün',
    icon: 'formattingTwo'
  }
};

// İxrac edilə bilən sütun tip seçimləri
export const columnTypeOptions = Object.keys(columnTypes).map(type => ({
  value: type,
  label: columnTypes[type as ColumnType].label,
  description: columnTypes[type as ColumnType].description,
  icon: columnTypes[type as ColumnType].icon
}));

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  status: string;
  lastUpdate: string;
  pendingForms: number;
  principal?: string;
  principalName?: string;
  formsCompleted?: number;
  totalForms?: number; 
  address?: string;
  phone?: string;
  email?: string;
}

export type CategoryFilter = {
  search?: string;
  status?: string[];
  assignment?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

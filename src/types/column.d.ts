
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
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    required?: boolean;
  };
  default_value?: string;
  options?: ColumnOption[];
  created_at?: string;
  updated_at?: string;
  deadline?: Date;
}

export interface ColumnOption {
  id?: string;
  label: string;
  value: string;
  color?: string;
  disabled?: boolean;
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

export interface ColumnValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
  errorMessage?: string;
}


// Əgər bu fayl mövcud deyilsə, onu yaradaq
export interface ValidationRules {
  required?: boolean;
  min?: number; // minimum dəyər
  max?: number; // maksimum dəyər
  minLength?: number; // minimum simvol sayı
  maxLength?: number; // maksimum simvol sayı
  pattern?: string; // regex paterni
  email?: boolean; // email validasiyası
  url?: boolean; // URL validasiyası
  numeric?: boolean; // rəqəm validasiyası
  integer?: boolean; // tam rəqəm validasiyası
  date?: boolean; // tarix validasiyası
  custom?: string; // xüsusi validasiya
  minValue?: number; // minimum dəyər - əlavə edildi
  maxValue?: number; // maksimum dəyər - əlavə edildi
  tel?: boolean; // telefon validasiyası - əlavə edildi
  minDate?: string; // minimum tarix - əlavə edildi
  maxDate?: string; // maksimum tarix - əlavə edildi
}

export interface ColumnOption {
  id: string;
  label: string;
  value: string;
  color?: string;
}

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
  name: string;
  type: ColumnType;
  category_id: string;
  is_required?: boolean;
  order_index?: number;
  options?: ColumnOption[];
  help_text?: string;
  placeholder?: string;
  default_value?: string | number | boolean;
  validation?: ValidationRules;
  status?: 'active' | 'inactive' | string;
  created_at?: string;
  updated_at?: string;
  description?: string; // əlavə edildi
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id?: string;
  is_required: boolean;
  order_index?: number;
  options?: ColumnOption[];
  help_text?: string;
  placeholder?: string;
  default_value?: string | number | boolean;
  validation?: ValidationRules;
  status: 'active' | 'inactive' | 'draft';
  description?: string; // əlavə edildi
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

// İkon adlarını və izahlarını təyin etmək üçün obyekt
export const columnTypeDefinitions = {
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

// columnTypes əlavə edirik
export const columnTypes = columnTypeDefinitions;

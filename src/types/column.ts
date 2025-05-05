
export type ColumnType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'file' 
  | 'image'
  | 'email'
  | 'link'
  | 'url'     // Əlavə edildi
  | 'phone'
  | 'tel'     // Əlavə edildi
  | 'range'   // Əlavə edildi
  | 'slider'
  | 'color'
  | 'time'
  | 'password' // Əlavə edildi
  | 'datetime'
  | 'richtext' // Əlavə edildi
  | 'textarea';

export interface ColumnOption {
  label: string;
  value: string;
  id?: string;    // Əlavə edildi
  color?: string; // Əlavə edildi
}

export interface ColumnValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  message?: string;
}

export interface Column {
  id: string;
  category_id?: string;
  name: string;
  description?: string;
  type: ColumnType;
  order_index?: number;
  is_required?: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  options?: ColumnOption[] | string;
  validation?: ColumnValidation;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  section?: string;
  related?: string[];
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  status?: string;
  columns?: Column[];
  completionRate?: number;
  related?: string[];
  assignment?: 'all' | 'sectors';
}

// İcon tipləri və sütun tipi tərifləri
interface ColumnTypeDefinition {
  label: string;
  description: string;
  icon: string;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
  hasOptions?: boolean;
  hasValidation?: boolean;
}

export const COLUMN_TYPE_DEFINITIONS: Record<ColumnType, ColumnTypeDefinition> = {
  text: {
    label: 'Mətn',
    description: 'Qısa mətn daxil etmə sahəsi',
    icon: 'text',
    dataType: 'string',
    hasValidation: true,
  },
  textarea: {
    label: 'Mətn sahəsi',
    description: 'Böyük mətn daxil etmə sahəsi',
    icon: 'textAlignLeft',
    dataType: 'string',
    hasValidation: true,
  },
  number: {
    label: 'Rəqəm',
    description: 'Rəqəm daxil etmə sahəsi',
    icon: 'hash',
    dataType: 'number',
    hasValidation: true,
  },
  date: {
    label: 'Tarix',
    description: 'Tarix seçimi',
    icon: 'calendar',
    dataType: 'date',
    hasValidation: true,
  },
  select: {
    label: 'Seçim',
    description: 'Açılan siyahıdan seçim',
    icon: 'listBox',
    dataType: 'string',
    hasOptions: true,
  },
  checkbox: {
    label: 'Çoxlu seçim',
    description: 'Bir neçə variant seçimi',
    icon: 'check',
    dataType: 'array',
    hasOptions: true,
  },
  radio: {
    label: 'Radio seçim',
    description: 'Bir variant seçimi',
    icon: 'circle',
    dataType: 'string',
    hasOptions: true,
  },
  file: {
    label: 'Fayl yüklə',
    description: 'Fayl yükləmək üçün',
    icon: 'file',
    dataType: 'string',
  },
  image: {
    label: 'Şəkil',
    description: 'Şəkil yükləmək üçün',
    icon: 'image',
    dataType: 'string',
  },
  email: {
    label: 'Email',
    description: 'Email daxil etmə sahəsi',
    icon: 'mail',
    dataType: 'string',
    hasValidation: true,
  },
  link: {
    label: 'Link',
    description: 'URL daxil etmə sahəsi',
    icon: 'link',
    dataType: 'string',
    hasValidation: true,
  },
  url: {
    label: 'URL',
    description: 'Veb sayt URL-i daxil etmə sahəsi',
    icon: 'link',
    dataType: 'string',
    hasValidation: true,
  },
  phone: {
    label: 'Telefon',
    description: 'Telefon nömrəsi daxil etmə sahəsi',
    icon: 'phone',
    dataType: 'string',
    hasValidation: true,
  },
  tel: {
    label: 'Telefon',
    description: 'Telefon nömrəsi daxil etmə sahəsi',
    icon: 'phone',
    dataType: 'string',
    hasValidation: true,
  },
  slider: {
    label: 'Slider',
    description: 'Slayder ilə rəqəm seçimi',
    icon: 'sliders',
    dataType: 'number',
    hasValidation: true,
  },
  range: {
    label: 'Diapazon',
    description: 'Minimum və maksimum dəyər seçimi',
    icon: 'sliders',
    dataType: 'string',
    hasValidation: true,
  },
  color: {
    label: 'Rəng',
    description: 'Rəng seçimi',
    icon: 'palette',
    dataType: 'string',
  },
  password: {
    label: 'Şifrə',
    description: 'Gizli mətn daxil etmə sahəsi',
    icon: 'lock',
    dataType: 'string',
    hasValidation: true,
  },
  time: {
    label: 'Vaxt',
    description: 'Vaxt seçimi',
    icon: 'clock',
    dataType: 'string',
  },
  datetime: {
    label: 'Tarix və vaxt',
    description: 'Tarix və vaxt seçimi',
    icon: 'calendarClock',
    dataType: 'date',
    hasValidation: true,
  },
  richtext: {
    label: 'Formatlaşdırılmış mətn',
    description: 'Mətn formatlaşdırma ilə',
    icon: 'formattingTwo',
    dataType: 'string',
  }
};

// Kateqoriya tipi tərifləri
export type CategoryStatus = 'active' | 'inactive' | 'draft' | 'approved';
export type CategoryAssignment = 'all' | 'sectors';



/**
 * Column və bağlı tiplərin tam tərifi və konfiqurasiya faylı.
 * Burada həm də ColumnType, ColumnValidation, CategoryWithColumns və əlaqəli konfiqurasiya obyektləri mövcuddur.
 */

export type ColumnType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
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

export interface ColumnOption {
  label: string;
  value: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
}

export interface ValidationRules {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  step?: number;
  minDate?: string;
  maxDate?: string;
  required?: boolean;
  pattern?: string;
  patternMessage?: string;
  email?: boolean;
  url?: boolean;
  numeric?: boolean;
  integer?: boolean;
  date?: boolean;
  custom?: any;
  customMessage?: string;
}

export interface ColumnValidation extends ValidationRules {}

export interface Column {
  id: string;
  category_id?: string;
  name: string;
  type: ColumnType;
  placeholder?: string;
  help_text?: string;
  is_required?: boolean;
  default_value?: string;
  options?: ColumnOption[] | Record<string, any>;
  validation?: ValidationRules;
  order_index?: number;
  status?: 'active' | 'inactive' | 'deleted';
  created_at?: string;
  updated_at?: string;

  // Yeni sahələr (formlar və parent/şərt funksionallığı üçün)
  parent_column_id?: string | null;
  dependencies?: string[]; // Hansı sütunlardan asılıdır (bir neçə parent sütuna bağlılıq üçün)
  visibility_conditions?: {
    column_id: string;
    operator: string;
    value: any;
  }[];
}

// Sütunun bir kateqoriyadakı tərifi
export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  status?: string;
  assignment?: string;
  deadline?: string;
  created_at?: string;
  updated_at?: string;
  columns: Column[];
  priority?: number;
  archived?: boolean;
}

// Sütun tipləri üçün konfiqurasiya və göstəricilər
export const COLUMN_TYPE_DEFINITIONS: Record<
  ColumnType,
  {
    icon: string;
    label: string;
    description: string;
    validations?: (keyof ValidationRules)[];
    defaultValidation?: Partial<ValidationRules>;
  }
> = {
  text: {
    icon: 'Text',
    label: 'Mətn',
    description: 'Qısa mətn üçün sahə',
    validations: ['minLength', 'maxLength', 'pattern'],
    defaultValidation: { minLength: 0, maxLength: 255 }
  },
  textarea: {
    icon: 'AlignLeft',
    label: 'Çoxsətirli mətn',
    description: 'Uzun mətn, şərhlər üçün sahə',
    validations: ['minLength', 'maxLength'],
    defaultValidation: { minLength: 0 }
  },
  number: {
    icon: 'Hash',
    label: 'Say',
    description: 'Rəqəmlər üçün sahə',
    validations: ['minValue', 'maxValue', 'step'],
    defaultValidation: { minValue: 0, maxValue: undefined }
  },
  select: {
    icon: 'List',
    label: 'Seçim',
    description: 'Bir dəyər seçmək üçün drop-down',
    validations: [],
  },
  checkbox: {
    icon: 'CheckSquare',
    label: 'Checkbox',
    description: 'Bir neçə seçim üçün checkbox',
    validations: [],
  },
  radio: {
    icon: 'Dot',
    label: 'Radio button',
    description: 'Bir seçim üçün radio',
    validations: [],
  },
  date: {
    icon: 'Calendar',
    label: 'Tarix',
    description: 'Tarix seçimi',
    validations: ['minDate', 'maxDate'],
    defaultValidation: {}
  },
  file: {
    icon: 'Paperclip',
    label: 'Fayl',
    description: 'Fayl əlavə et',
    validations: [],
  },
  image: {
    icon: 'Image',
    label: 'Şəkil',
    description: 'Şəkil yüklə',
    validations: [],
  },
  email: {
    icon: 'Mail',
    label: 'Email',
    description: 'Email ünvanı üçün',
    validations: ['pattern', 'email'],
    defaultValidation: {
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      email: true
    }
  },
  url: {
    icon: 'Link',
    label: 'URL',
    description: 'Veb sayt linki üçün',
    validations: ['pattern', 'url'],
    defaultValidation: {
      pattern:
        '^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})[\\/\\w .-]*/?$',
      url: true
    }
  },
  phone: {
    icon: 'Phone',
    label: 'Telefon',
    description: 'Telefon nömrəsi üçün sahə',
    validations: ['pattern'],
    defaultValidation: {
      pattern: '^\\+[0-9]{10,15}$'
    }
  },
  range: {
    icon: 'SlidersHorizontal',
    label: 'Range',
    description: 'Ən aşağı və ən yüksək dəyərlər üçün range input',
    validations: ['minValue', 'maxValue'],
    defaultValidation: {}
  },
  color: {
    icon: 'Palette',
    label: 'Rəng',
    description: 'Rəng seçimi',
    validations: [],
  },
  password: {
    icon: 'Key',
    label: 'Şifrə',
    description: 'Şifrə sahəsi',
    validations: ['minLength', 'maxLength'],
    defaultValidation: { minLength: 6 }
  },
  time: {
    icon: 'Clock',
    label: 'Saat',
    description: 'Saat seçimi üçün sahə',
    validations: [],
  },
  datetime: {
    icon: 'CalendarClock',
    label: 'Tarix və saat',
    description: 'Tarix və saat seçmək üçün',
    validations: [],
  },
  richtext: {
    icon: 'Heading1',
    label: 'Formatlaşdırılmış mətn',
    description: 'Formatlanmış (bold, italic və s.) mətn üçün sahə',
    validations: [],
  }
};

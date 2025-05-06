
export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  order_index?: number;
  status: 'active' | 'inactive' | 'draft';
  validation?: ValidationRules;
  default_value?: string;
  options?: ColumnOption[];
  created_at: string;
  updated_at: string;
  section?: string;
  parent_column_id?: string;
  version?: number;
}

export type ColumnType = 'text' | 'number' | 'date' | 'time' | 'phone' | 'color' | 'checkbox' | 'radio' | 'select' | 'textarea' | 'image' | 'file' | 'password' | 'range' | 'datetime' | 'richtext' | 'email' | 'url';

export interface ColumnTypeDefinition {
  label: string;
  description: string;
  icon: string;
  hasOptions?: boolean;
  hasValidation?: boolean;
}

export const columnTypes: Record<ColumnType, ColumnTypeDefinition> = {
  text: {
    label: 'Mətn',
    description: 'Qısa mətn daxil etmək üçün',
    icon: 'Text',
    hasValidation: true
  },
  textarea: {
    label: 'Mətn sahəsi',
    description: 'Çox sətirli mətn daxil etmək üçün',
    icon: 'AlignLeft',
    hasValidation: true
  },
  number: {
    label: 'Rəqəm',
    description: 'Rəqəm daxil etmək üçün',
    icon: 'Hash',
    hasValidation: true
  },
  date: {
    label: 'Tarix',
    description: 'Tarix seçmək üçün',
    icon: 'Calendar',
    hasValidation: true
  },
  select: {
    label: 'Seçim',
    description: 'Açılan siyahıdan seçim etmək üçün',
    icon: 'List',
    hasOptions: true
  },
  checkbox: {
    label: 'Seçim qutusu',
    description: 'Bəli/Xeyr tipli seçim üçün',
    icon: 'Check'
  },
  radio: {
    label: 'Radio düymələri',
    description: 'Bir neçə variantdan birini seçmək üçün',
    icon: 'Circle',
    hasOptions: true
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
    icon: 'Mail',
    hasValidation: true
  },
  url: {
    label: 'URL',
    description: 'Veb ünvan daxil etmək üçün',
    icon: 'Link',
    hasValidation: true
  },
  phone: {
    label: 'Telefon',
    description: 'Telefon nömrəsi daxil etmək üçün',
    icon: 'Phone',
    hasValidation: true
  },
  range: {
    label: 'Aralıq',
    description: 'Aralıq seçmək üçün',
    icon: 'Sliders',
    hasValidation: true
  },
  color: {
    label: 'Rəng',
    description: 'Rəng seçmək üçün',
    icon: 'Palette'
  },
  password: {
    label: 'Şifrə',
    description: 'Şifrə daxil etmək üçün',
    icon: 'Lock',
    hasValidation: true
  },
  time: {
    label: 'Vaxt',
    description: 'Vaxt seçmək üçün',
    icon: 'Clock'
  },
  datetime: {
    label: 'Tarix və vaxt',
    description: 'Tarix və vaxt seçmək üçün',
    icon: 'Calendar',
    hasValidation: true
  },
  richtext: {
    label: 'Zəngin mətn',
    description: 'Formatlanmış mətn daxil etmək üçün',
    icon: 'Type'
  }
};

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  assignment: string;
  status: string;
  deadline?: string;
  created_at: string;
  updated_at: string;
  columns: Column[];
}

export interface ColumnOption {
  value: string;
  label: string;
  id?: string;
  color?: string;
}

export interface ValidationRules {
  min?: number;
  max?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  tel?: boolean;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minDate?: string;
  maxDate?: string;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder: string;
  help_text: string;
  status: 'active' | 'inactive' | 'draft';
  order_index: number;
  default_value: string;
  options: ColumnOption[];
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
}

// Tip adaptasiyası - Category və CategoryWithColumns arasındakı uyğunluq
export type CategoryAssignment = string;

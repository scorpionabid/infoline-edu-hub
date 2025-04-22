
import { DataEntry } from './dataEntry';

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  order_index: number;
  help_text?: string;
  placeholder?: string;
  default_value?: string;
  options?: ColumnOption[];
  validation?: any;
  parent_column_id?: string;
  dependencies?: string[];
  visibility_conditions?: VisibilityCondition[];
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface ColumnOption {
  label: string;
  value: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
}

export interface VisibilityCondition {
  column_id: string;
  operator: string;
  value: any;
}

export interface ColumnValidation {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
  email?: boolean;
  url?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
  assignment?: 'all' | 'sectors';
  deadline?: string;
  priority?: number;
  column_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
}

export interface CategoryWithEntries extends CategoryWithColumns {
  entries: DataEntry[];
  completionPercentage?: number;
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
}

export interface CategoryResponse {
  categories: CategoryWithColumns[];
  loading: boolean;
  error: string | null;
}

export type ColumnType = 
  'text' | 
  'textarea' | 
  'number' | 
  'select' | 
  'checkbox' | 
  'radio' | 
  'date' | 
  'file' | 
  'image' | 
  'email' | 
  'url' | 
  'phone' | 
  'range' | 
  'color' | 
  'password' | 
  'time' | 
  'datetime' | 
  'richtext';

export interface ColumnTypeDefinition {
  icon: string;
  label: string;
  description: string;
  defaultValidation?: any;
}

export const COLUMN_TYPE_DEFINITIONS: Record<ColumnType, ColumnTypeDefinition> = {
  text: { 
    icon: 'AlignLeft', 
    label: 'Mətn', 
    description: 'Qısa mətn girişi',
    defaultValidation: { minLength: undefined, maxLength: undefined } 
  },
  textarea: { 
    icon: 'AlignJustify', 
    label: 'Uzun mətn', 
    description: 'Çox sətirli mətn girişi',
    defaultValidation: { minLength: undefined, maxLength: undefined } 
  },
  number: { 
    icon: 'Hash', 
    label: 'Rəqəm', 
    description: 'Rəqəm daxil etmək üçün',
    defaultValidation: { minValue: undefined, maxValue: undefined } 
  },
  select: { 
    icon: 'ListFilter', 
    label: 'Seçim', 
    description: 'Açılan siyahıdan seçim',
    defaultValidation: {} 
  },
  checkbox: { 
    icon: 'CheckSquare', 
    label: 'Çoxlu seçim', 
    description: 'Bir neçə seçim etmək üçün',
    defaultValidation: {} 
  },
  radio: { 
    icon: 'CircleDot', 
    label: 'Radio seçim', 
    description: 'Tək seçim etmək üçün',
    defaultValidation: {} 
  },
  date: { 
    icon: 'Calendar', 
    label: 'Tarix', 
    description: 'Tarix seçimi üçün',
    defaultValidation: {} 
  },
  file: { 
    icon: 'File', 
    label: 'Fayl', 
    description: 'Fayl yükləmək üçün',
    defaultValidation: {} 
  },
  image: { 
    icon: 'Image', 
    label: 'Şəkil', 
    description: 'Şəkil yükləmək üçün',
    defaultValidation: {} 
  },
  email: { 
    icon: 'Mail', 
    label: 'E-mail', 
    description: 'E-mail daxil etmək üçün',
    defaultValidation: { pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' } 
  },
  url: { 
    icon: 'Link', 
    label: 'URL', 
    description: 'İnternet ünvanı daxil etmək üçün',
    defaultValidation: { pattern: '^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?$' } 
  },
  phone: { 
    icon: 'Phone', 
    label: 'Telefon', 
    description: 'Telefon nömrəsi daxil etmək üçün',
    defaultValidation: {} 
  },
  range: { 
    icon: 'Sliders', 
    label: 'Diapazon', 
    description: 'Sürüngəc ilə rəqəm seçmək üçün',
    defaultValidation: { minValue: 0, maxValue: 100 } 
  },
  color: { 
    icon: 'Palette', 
    label: 'Rəng', 
    description: 'Rəng seçimi üçün',
    defaultValidation: {} 
  },
  password: { 
    icon: 'Lock', 
    label: 'Şifrə', 
    description: 'Gizli şifrə daxil etmək üçün',
    defaultValidation: { minLength: 6 } 
  },
  time: { 
    icon: 'Clock', 
    label: 'Vaxt', 
    description: 'Vaxt seçimi üçün',
    defaultValidation: {} 
  },
  datetime: { 
    icon: 'CalendarClock', 
    label: 'Tarix və vaxt', 
    description: 'Tarix və vaxt seçimi üçün',
    defaultValidation: {} 
  },
  richtext: { 
    icon: 'Type', 
    label: 'Formatlanmış mətn', 
    description: 'Formatlanmış mətn redaktoru',
    defaultValidation: {} 
  }
};


import { z } from 'zod';
import { Icons } from '@/components/ui/icons';

export interface ColumnValidation {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
  // Tarix üçün əlavələr
  minDate?: Date;
  maxDate?: Date;
  // Email və URL üçün
  email?: boolean;
  url?: boolean;
  // Xüsusi error mesajı
  customMessage?: string;
}

export interface ColumnOption {
  label: string;
  value: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
}

export interface ColumnDependency {
  column_id: string;
  operator: string;
  value: any;
}

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  order_index: number;
  status: 'active' | 'inactive' | 'draft';
  validation?: ColumnValidation;
  default_value?: any;
  options?: ColumnOption[] | string;
  created_at?: Date;
  updated_at?: Date;
  parent_column_id?: string | null;
  dependencies?: string[];
  visibility_conditions?: ColumnDependency[];
}

export type ColumnType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'select' 
  | 'date' 
  | 'checkbox' 
  | 'radio' 
  | 'email' 
  | 'url' 
  | 'phone' 
  | 'file' 
  | 'image'
  | 'range'
  | 'color'
  | 'password'
  | 'time'
  | 'datetime'
  | 'richtext';

export interface ColumnTypeDefinition {
  label: string;
  icon?: keyof typeof Icons;
  description?: string;
  defaultValidation?: ColumnValidation;
  validations?: string[];
  component?: string;
}

// Sütun tipləri üçün təriflər
export const COLUMN_TYPE_DEFINITIONS: Record<ColumnType, ColumnTypeDefinition> = {
  text: {
    label: 'Mətn',
    icon: 'text',
    description: 'Qısa mətn daxil etmək üçün',
    defaultValidation: { minLength: 0, maxLength: 255 },
    validations: ['minLength', 'maxLength', 'pattern', 'required']
  },
  textarea: {
    label: 'Mətn sahəsi',
    icon: 'alignLeft',
    description: 'Çox sətirli mətn daxil etmək üçün',
    defaultValidation: { minLength: 0, maxLength: 1000 },
    validations: ['minLength', 'maxLength', 'required']
  },
  number: {
    label: 'Rəqəm',
    icon: 'hash',
    description: 'Rəqəmsal dəyərlər üçün',
    defaultValidation: {},
    validations: ['minValue', 'maxValue', 'required']
  },
  select: {
    label: 'Seçim',
    icon: 'listFilter',
    description: 'Açılan siyahıdan bir element seçmək üçün',
    validations: ['required']
  },
  date: {
    label: 'Tarix',
    icon: 'calendar',
    description: 'Tarix daxil etmək üçün',
    defaultValidation: {},
    validations: ['minDate', 'maxDate', 'required']
  },
  checkbox: {
    label: 'Çoxlu seçim',
    icon: 'check',
    description: 'Bir neçə element seçmək üçün',
    validations: ['required']
  },
  radio: {
    label: 'Radio düymələri',
    icon: 'radioTower',
    description: 'Bir element seçmək üçün',
    validations: ['required']
  },
  email: {
    label: 'E-poçt',
    icon: 'mail',
    description: 'E-poçt ünvanı daxil etmək üçün',
    defaultValidation: { email: true, pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
    validations: ['required', 'pattern']
  },
  url: {
    label: 'URL',
    icon: 'link',
    description: 'Veb sayt ünvanı daxil etmək üçün',
    defaultValidation: { url: true, pattern: '^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?$' },
    validations: ['required', 'pattern']
  },
  phone: {
    label: 'Telefon',
    icon: 'phone',
    description: 'Telefon nömrəsi daxil etmək üçün',
    defaultValidation: { pattern: '^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$' },
    validations: ['required', 'pattern']
  },
  file: {
    label: 'Fayl',
    icon: 'file',
    description: 'Fayl yükləmək üçün',
    validations: ['required']
  },
  image: {
    label: 'Şəkil',
    icon: 'image',
    description: 'Şəkil yükləmək üçün',
    validations: ['required']
  },
  range: {
    label: 'Diapazon',
    icon: 'arrowRightLeft',
    description: 'Min və max arasında dəyər seçmək üçün',
    defaultValidation: { minValue: 0, maxValue: 100 },
    validations: ['minValue', 'maxValue', 'required']
  },
  color: {
    label: 'Rəng',
    icon: 'palette',
    description: 'Rəng seçmək üçün',
    validations: ['required']
  },
  password: {
    label: 'Şifrə',
    icon: 'lock',
    description: 'Təhlükəsiz şifrə daxil etmək üçün',
    defaultValidation: { minLength: 8 },
    validations: ['minLength', 'pattern', 'required']
  },
  time: {
    label: 'Vaxt',
    icon: 'clock',
    description: 'Vaxt daxil etmək üçün',
    validations: ['required']
  },
  datetime: {
    label: 'Tarix və vaxt',
    icon: 'calendarClock',
    description: 'Tarix və vaxt daxil etmək üçün',
    validations: ['required']
  },
  richtext: {
    label: 'Formatlanmış mətn',
    icon: 'textCursorInput',
    description: 'Formatlanmış mətn redaktoru',
    defaultValidation: {},
    validations: ['minLength', 'maxLength', 'required']
  }
};

// Column validation üçün zod sxemi 
export const columnValidationSchema = z.object({
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  required: z.boolean().optional(),
  minDate: z.date().optional(),
  maxDate: z.date().optional(),
  email: z.boolean().optional(),
  url: z.boolean().optional(),
  customMessage: z.string().optional()
});

// Column options üçün zod sxemi
export const columnOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  disabled: z.boolean().optional()
});

// Column dependency üçün zod sxemi
export const columnDependencySchema = z.object({
  column_id: z.string(),
  operator: z.string(),
  value: z.any()
});

// Column üçün zod sxemi
export const columnSchema = z.object({
  id: z.string(),
  category_id: z.string(),
  name: z.string(),
  type: z.string(),
  is_required: z.boolean().default(true),
  placeholder: z.string().optional(),
  help_text: z.string().optional(),
  order_index: z.number().default(0),
  status: z.enum(['active', 'inactive', 'draft']).default('active'),
  validation: z.record(z.any()).optional(),
  default_value: z.any().optional(),
  options: z.union([z.array(columnOptionSchema), z.string()]).optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
  parent_column_id: z.string().nullable().optional(),
  dependencies: z.array(z.string()).optional(),
  visibility_conditions: z.array(columnDependencySchema).optional()
});

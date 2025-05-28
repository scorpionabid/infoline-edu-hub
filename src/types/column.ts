
import { LucideIcon } from 'lucide-react';

export type ColumnType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'email' 
  | 'url' 
  | 'phone'
  | 'date' 
  | 'time' 
  | 'datetime'
  | 'select' 
  | 'radio' 
  | 'checkbox'
  | 'file' 
  | 'image'
  | 'range'
  | 'color'
  | 'password'
  | 'richtext';

export interface ColumnOption {
  id?: string;
  value: string;
  label: string;
}

export interface ColumnValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
  minValue?: number;
  maxValue?: number;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  category_id: string;
  description?: string;
  is_required?: boolean;
  required?: boolean;
  options?: ColumnOption[];
  validation?: ColumnValidation;
  help_text?: string;
  placeholder?: string;
  default_value?: string;
  status?: string;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
  section?: string;
}

export interface ColumnFormValues {
  name: string;
  type: ColumnType;
  category_id: string;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  description?: string;
  section?: string;
  validation?: ColumnValidation;
  options?: ColumnOption[];
  order_index?: number;
}

export interface ColumnTypeDefinition {
  value: ColumnType;
  label: string;
  description: string;
  icon: string;
}

export const columnTypeDefinitions: ColumnTypeDefinition[] = [
  { value: 'text', label: 'Mətn', description: 'Qısa mətn sahəsi', icon: '📝' },
  { value: 'textarea', label: 'Uzun mətn', description: 'Çox sətrli mətn sahəsi', icon: '📄' },
  { value: 'number', label: 'Rəqəm', description: 'Rəqəmsal dəyər', icon: '🔢' },
  { value: 'email', label: 'E-poçt', description: 'E-poçt ünvanı', icon: '📧' },
  { value: 'url', label: 'URL', description: 'Veb ünvanı', icon: '🔗' },
  { value: 'phone', label: 'Telefon', description: 'Telefon nömrəsi', icon: '📞' },
  { value: 'date', label: 'Tarix', description: 'Tarix seçimi', icon: '📅' },
  { value: 'time', label: 'Vaxt', description: 'Vaxt seçimi', icon: '⏰' },
  { value: 'datetime', label: 'Tarix və Vaxt', description: 'Tarix və vaxt seçimi', icon: '📆' },
  { value: 'select', label: 'Seçim siyahısı', description: 'Açılan seçim siyahısı', icon: '📋' },
  { value: 'radio', label: 'Radio düymələr', description: 'Tək seçim düymələri', icon: '🔘' },
  { value: 'checkbox', label: 'Yoxlama qutuları', description: 'Çoxlu seçim qutuları', icon: '☑️' },
  { value: 'file', label: 'Fayl', description: 'Fayl yükləmə', icon: '📎' },
  { value: 'image', label: 'Şəkil', description: 'Şəkil yükləmə', icon: '🖼️' },
  { value: 'range', label: 'Diapazon', description: 'Diapazon seçimi', icon: '📏' },
  { value: 'color', label: 'Rəng', description: 'Rəng seçimi', icon: '🎨' },
  { value: 'password', label: 'Şifrə', description: 'Şifrə sahəsi', icon: '🔐' },
  { value: 'richtext', label: 'Zəngin mətn', description: 'Formatlanmış mətn editoru', icon: '📝' }
];

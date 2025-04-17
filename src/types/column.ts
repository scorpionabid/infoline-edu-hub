
import { Json } from '@/integrations/supabase/types';

// Əsas sütun interfeysi
export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  order_index: number;
  status: 'active' | 'inactive' | 'archived';
  parent_column_id?: string | null;
  validation?: ValidationRules | Json;
  default_value?: string | null;
  options?: ColumnOption[] | Json;
  created_at: string;
  updated_at: string;
  entry?: any; // Data daxil edilərkən istifadə olunur
}

// Sütun tipi
export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'file' | 'image';

// Sütun seçim variantları üçün interfeys
export interface ColumnOption {
  value: string;
  label: string;
}

// Köhnə adı saxlayaq (bəzən bu ad ilə istifadə olunur)
export type ColumnOptions = ColumnOption[];

// Validasiya qaydaları üçün interfeys
export interface ValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  numeric?: boolean;
  integer?: boolean;
  date?: boolean;
  minValue?: number;
  maxValue?: number;
  custom?: string;
}

// Sütün yaratma/yeniləmə formu üçün dəyərlər
export interface ColumnFormValues {
  name: string;
  category_id: string;
  type: string;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  order_index?: number;
  status?: string;
  parent_column_id?: string | null;
  validation?: Record<string, any>;
  options?: ColumnOption[];
  default_value?: string;
}

// Sütunları kategori ilə birləşdirən tip
export interface CategoryWithColumns {
  id: string;
  name: string;
  columns: Column[];
  columnCount?: number;
}

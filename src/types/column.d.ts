
export type ColumnType = 'text' | 'textarea' | 'number' | 'select' | 'date' | 'checkbox' | 'radio' | 'file' | 'email' | 'url' | 'phone' | 'image' | 'range' | 'color' | 'password' | 'time' | 'datetime' | 'richtext';

export type CategoryStatus = 'active' | 'inactive' | 'draft' | 'approved' | 'pending' | 'rejected';
export type DataEntryStatus = 'draft' | 'pending' | 'approved' | 'rejected';

// Sütun validasiyası üçün tipler
export interface ColumnValidation {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
  requiredMessage?: string;
  patternMessage?: string;
  email?: boolean;
  url?: boolean;
  custom?: string;
  inclusion?: string[];
  exclusion?: string[];
  customMessage?: string;
}

export interface ColumnValidationError {
  field?: string;
  message: string;
  type: string;
  severity?: 'error' | 'warning' | 'info';
}

// Sütun seçimləri üçün tipler
export interface ColumnOption {
  label: string;
  value: string;
}

// Sütun tipi
export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  is_required?: boolean;
  placeholder?: string;
  help_text?: string;
  order_index?: number;
  status?: 'active' | 'inactive' | 'draft';
  validation?: ColumnValidation;
  default_value?: string;
  options?: ColumnOption[];
  created_at?: string;
  updated_at?: string;
  parent_id?: string;
  conditional_display?: any;
}

// Kateqoriya tipi
export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment?: 'all' | 'sectors';
  deadline?: string;
  status: CategoryStatus;
  priority?: number;
  created_at?: string;
  updated_at?: string;
  archived?: boolean;
  column_count?: number;
  completionPercentage?: number;
}

// Kateqoriya və onun sütunları
export interface CategoryWithColumns extends Category {
  columns: Column[];
  completionPercentage?: number;
}

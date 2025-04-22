
export type Region = {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
}

export type School = {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  address?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
}

export type Sector = {
  id: string;
  name: string;
  region_id: string;
  description?: string;
  status: 'active' | 'inactive';
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
}

export type CategoryStatus = 'active' | 'inactive';

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
  'url';

export interface CategoryWithColumns {
  id: string;
  name: string;
  status: CategoryStatus;
  columns?: Column[];
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  category_id: string;
  is_required?: boolean;
  validation?: ColumnValidation;
  options?: any[];
  help_text?: string;
  placeholder?: string;
}

export interface ColumnValidation {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
}

export const COLUMN_TYPE_DEFINITIONS: ColumnType[] = [
  'text', 
  'textarea', 
  'number', 
  'select', 
  'checkbox', 
  'radio', 
  'date', 
  'file', 
  'image'
];

export interface ColumnTypeDefinition {
  type: ColumnType;
  icon?: string;
  label?: string;
  description?: string;
}

export const COLUMN_TYPE_DETAILS: ColumnTypeDefinition[] = [
  { 
    type: 'text', 
    icon: 'AlignLeft', 
    label: 'Mətn', 
    description: 'Qısa mətn girişi' 
  },
  // Digər tiplər əlavə edilə bilər
];

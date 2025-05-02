
export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: CategoryAssignment;
  status: CategoryStatus;
  priority?: number;
  deadline?: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
  column_count?: number;
}

export type CategoryAssignment = 'all' | 'sectors';
export type CategoryStatus = 'active' | 'inactive' | 'draft' | 'pending' | 'approved' | 'rejected';

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors';
  status: 'active' | 'inactive' | 'draft' | 'pending' | 'approved' | 'rejected';
  priority?: number;
  deadline?: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
  columns: Column[];
  entries?: DataEntry[];
  completionPercentage?: number;
}

export interface CategoryFilter {
  status?: CategoryStatus | 'all';
  assignment?: AssignmentType | 'all';
  search?: string;
}

export type FormStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'all';
export type AssignmentType = 'all' | 'sectors';

export interface Column {
  id: string;
  category_id: string;
  name: string;
  type: ColumnType;
  help_text?: string;
  placeholder?: string;
  default_value?: string;
  is_required: boolean;
  options?: any[];
  order_index: number;
  status: 'active' | 'inactive';
  validation?: ColumnValidation;
  created_at: string;
  updated_at: string;
}

export type ColumnType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'image';

export interface ColumnValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
  requiredMessage?: string;
  patternMessage?: string;
  email?: boolean;
  url?: boolean;
  min?: number;
  max?: number;
  inclusion?: string[];
}

export interface DataEntry {
  id: string;
  column_id: string;
  category_id: string;
  school_id: string;
  value: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  approved_by?: string;
  approved_at?: Date;
  rejected_by?: string;
  rejected_at?: Date;
  rejection_reason?: string;
}

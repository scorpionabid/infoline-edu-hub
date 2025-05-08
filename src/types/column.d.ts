
export interface Column {
  id: string;
  name: string;
  type: string;
  category_id: string;
  is_required?: boolean;
  placeholder?: string;
  help_text?: string;
  status: string;
  order_index?: number;
  default_value?: string;
  options?: any[] | Record<string, string>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  status?: string;
  completionRate?: number;
  columns: Column[];
}

export interface CategoryWithEntries {
  id: string;
  name: string;
  description?: string;
  status?: string;
  completionRate: number;
  entries?: Record<string, any>;
}

export interface TabDefinition {
  id: string;
  label: string;
  columns: Column[];
}

export interface CategoryFilter {
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ColumnFormData {
  id?: string;
  name: string;
  type: string;
  category_id: string;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  status?: string;
  order_index?: number;
  default_value?: string;
  options?: any[] | Record<string, string>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface CategoryEntryData {
  id: string;
  categoryId: string;
  schoolId?: string;
  values: Record<string, any>;
  status?: string;
  isModified?: boolean;
  errors?: Record<string, string>;
}

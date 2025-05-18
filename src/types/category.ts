
export interface Category {
  id: string;
  name: string;
  description?: string;
  archived?: boolean;
  status?: string;
  assignment?: string;
  deadline?: string | Date;
  priority?: number;
  column_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryFilter {
  search: string;
  status: string | null;
  assignment: string | null;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
}

export interface Column {
  id: string;
  name: string;
  type: string;
  category_id?: string;
  is_required?: boolean;
  help_text?: string;
  placeholder?: string;
  options?: any;
  validation?: any;
  default_value?: string;
  order_index?: number;
  status?: string;
  section?: string;
  created_at?: string;
  updated_at?: string;
}

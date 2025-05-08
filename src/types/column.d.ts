
export interface Column {
  id: string;
  name: string;
  type: string;
  category_id?: string;
  is_required?: boolean;
  order_index?: number;
  options?: string[] | Record<string, string> | any;
  validation?: any;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  status?: string;
  deadline?: string | Date;
  created_at?: string | Date;
  updated_at?: string | Date;
  column_count?: number;
  priority?: number;
  assignment?: string;
  archived?: boolean;
  columns: Column[];
}

export interface TabDefinition {
  id: string;
  label: string;
}

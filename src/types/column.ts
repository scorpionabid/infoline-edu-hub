
import { DataEntry } from './dataEntry';

export interface Column {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'date' | 'checkbox' | 'radio' | 'file' | 'image';
  category_id: string;
  is_required: boolean;
  order_index: number;
  help_text?: string;
  placeholder?: string;
  default_value?: string;
  options?: any[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
  };
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
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

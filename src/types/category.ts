
import { Column } from './column';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status?: string;
  priority?: number;
  deadline?: string;
  assignment?: string;
  archived?: boolean;
  column_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
}

export interface CategoryFilter {
  search: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

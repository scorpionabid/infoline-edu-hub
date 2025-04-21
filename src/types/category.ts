
import { Column } from './column';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status?: string;
  assignment?: string;
  deadline?: string;
  created_at?: string;
  updated_at?: string;
  priority?: number;
  archived?: boolean;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
}

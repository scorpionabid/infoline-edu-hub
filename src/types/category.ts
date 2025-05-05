
import { Column } from './column';

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors';
  status: 'active' | 'inactive' | 'draft';
  priority?: number;
  deadline?: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
  column_count?: number;
}

// CategoryWithColumns tipini column.ts faylından import edəcəyik
// əlavə təriflərə ehtiyac yoxdur
import { CategoryWithColumns } from './column';
export { CategoryWithColumns };

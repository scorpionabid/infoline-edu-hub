
export type CategoryStatus = 'active' | 'inactive' | 'draft';
export type CategoryAssignment = 'all' | 'sectors';

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment?: CategoryAssignment;
  status?: CategoryStatus;
  deadline?: string | Date;
  created_at?: string | Date;
  updated_at?: string;
  priority?: number;
  archived?: boolean;
  column_count?: number;
}

export interface CategoryFilter {
  status: 'all' | CategoryStatus;
  assignment: 'all' | CategoryAssignment;
  deadline: 'all' | 'past' | 'upcoming' | 'none';
}

// CategoryWithColumns tipini column.ts faylından import edəcəyik
import { CategoryWithColumns } from './column';
export { CategoryWithColumns };

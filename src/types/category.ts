
export type CategoryStatus = 'active' | 'inactive' | 'draft' | 'archived';
export type CategoryAssignment = 'all' | 'sectors';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status?: CategoryStatus;
  deadline?: string;
  assignment?: CategoryAssignment;
  column_count?: number;
  archived?: boolean;
  priority?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
  columnCount?: number;
}

// Tip uyğunluğunu təmin etmək üçün Column tipinə istinad
import { Column } from './column';

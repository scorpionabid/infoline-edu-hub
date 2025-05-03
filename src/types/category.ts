
import { Column } from '@/types/column';

export type CategoryStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
export type CategoryAssignment = 'all' | 'sectors';

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: CategoryAssignment;
  status: CategoryStatus;
  priority: number;
  deadline?: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
  completionRate?: number;
  column_count?: number;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
  completionRate?: number;
}


import { Column } from './column';

export type AssignmentType = 'sectors' | 'all';

export type FormStatus = 'completed' | 'dueSoon' | 'overdue' | 'pending' | 'draft' | 'approved' | 'rejected' | 'active' | 'inactive';

export interface CategoryFilter {
  status?: FormStatus | FormStatus[];
  assignment?: AssignmentType;
  search?: string;
  deadline?: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: AssignmentType;
  status: 'active' | 'inactive' | 'draft';
  deadline?: Date;
  created_at: Date;
  updated_at: Date;
  archived: boolean;
  priority: number;
  completionPercentage?: number;
  column_count?: number;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
}

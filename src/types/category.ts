
import { UserRole } from './supabase';

export type AssignmentType = 'sectors' | 'all';

export type FormStatus = 'completed' | 'dueSoon' | 'overdue' | 'pending';

export interface CategoryFilter {
  status?: FormStatus[];
  assignment?: AssignmentType;
  search?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: AssignmentType;
  status: 'active' | 'inactive';
  deadline?: Date;
  created_at: Date;
  updated_at: Date;
  archived: boolean;
  priority: number;
  completionPercentage?: number;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
}


import { Column, ColumnType, ColumnOption, CategoryStatus } from './column';
import { Json } from './json';

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment?: 'all' | 'sectors';
  deadline?: string;
  status?: CategoryStatus;
  priority?: number;
  created_at?: string;
  updated_at?: string;
  archived?: boolean;
  column_count?: number;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
  completionPercentage?: number;
}

export interface CategoryFilter {
  status: 'all' | 'active' | 'inactive' | 'archived';
  assignment: 'all' | 'sectors';
  deadline: 'all' | 'upcoming' | 'passed' | 'none';
}

export interface CategoryFormData {
  name: string;
  description?: string;
  assignment: 'all' | 'sectors';
  deadline?: string;
  status: CategoryStatus;
  priority?: number;
}

export type FormStatus = 'completed' | 'pending' | 'rejected' | 'dueSoon' | 'overdue' | 'approved' | 'draft';

export const adaptSupabaseCategory = (data: any): Category => {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    assignment: data.assignment || 'all',
    deadline: data.deadline,
    status: data.status || 'active',
    priority: data.priority || 0,
    created_at: data.created_at,
    updated_at: data.updated_at,
    archived: data.archived || false,
    column_count: data.column_count || 0
  };
};

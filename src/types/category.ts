
import { CategoryWithColumns, CategoryStatus, FormStatus } from './column';

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment?: 'all' | 'sectors';
  deadline?: string;
  status: CategoryStatus;
  priority?: number;
  created_at: string;
  updated_at: string;
  column_count?: number;
  archived?: boolean;
}

export type CategoryFilter = {
  status?: 'all' | 'active' | 'inactive' | 'draft';
  assignment?: 'all' | 'sectors';
  deadline?: 'all' | 'upcoming' | 'past';
};

export { CategoryStatus, FormStatus };

export const adaptCategoryToSupabase = (category: Partial<Category> & { name: string }): any => {
  return {
    name: category.name,
    description: category.description || null,
    assignment: category.assignment || 'all',
    deadline: category.deadline || null,
    status: category.status || 'active',
    priority: category.priority || 0,
    column_count: category.column_count || 0,
    archived: category.archived || false
  };
};

export const adaptSupabaseCategory = (dbCategory: any): Category => {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    description: dbCategory.description || '',
    assignment: dbCategory.assignment || 'all',
    deadline: dbCategory.deadline || null,
    status: dbCategory.status || 'active',
    priority: dbCategory.priority || 0,
    created_at: dbCategory.created_at,
    updated_at: dbCategory.updated_at,
    column_count: dbCategory.column_count || 0,
    archived: dbCategory.archived || false
  };
};

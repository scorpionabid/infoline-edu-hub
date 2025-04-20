
import { CategoryWithColumns, CategoryStatus } from './column';

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment?: string;
  deadline?: string;
  status: string;
  priority?: number;
  created_at: string;
  updated_at: string;
  column_count?: number;
}

export type CategoryFilter = 'all' | 'active' | 'inactive' | 'draft';
export { CategoryStatus, FormStatus } from './column';

export const adaptCategoryToSupabase = (category: Partial<Category> & { name: string }): any => {
  return {
    name: category.name,
    description: category.description || null,
    assignment: category.assignment || 'all',
    deadline: category.deadline || null,
    status: category.status || 'active',
    priority: category.priority || 0,
    column_count: category.column_count || 0
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
    column_count: dbCategory.column_count || 0
  };
};

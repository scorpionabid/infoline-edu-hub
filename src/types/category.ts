
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
}

export { CategoryStatus };

export const adaptCategoryToSupabase = (category: Partial<Category>): any => {
  return {
    name: category.name,
    description: category.description || null,
    assignment: category.assignment || 'all',
    deadline: category.deadline || null,
    status: category.status || 'active',
    priority: category.priority || 0
  };
};

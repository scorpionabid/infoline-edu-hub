
export type CategoryStatus = 'active' | 'inactive' | 'draft' | 'archived' | 'pending' | 'completed' | 'approved';
export type CategoryAssignment = 'all' | 'region' | 'sector' | 'school';

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment?: string;
  deadline?: string;
  status: CategoryStatus;
  priority?: number;
  column_count?: number;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryWithColumns extends Category {
  columns: any[];
}

export interface CategoryFilter {
  status: string[];
  priority: string[];
  assignment: string[];
  search?: string;
}

export interface TabDefinition {
  id: string;
  label: string;
  status?: CategoryStatus | 'all';
  count?: number;
}

export interface CategoryContext {
  categories: Category[];
  loading: boolean;
  error: Error | null;
  fetchCategories: () => Promise<void>;
  createCategory: (categoryData: Partial<Category>) => Promise<Category>;
  updateCategory: (id: string, categoryData: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  updateCategoryStatus: (id: string, status: CategoryStatus) => Promise<void>;
  isLoading: boolean;
}

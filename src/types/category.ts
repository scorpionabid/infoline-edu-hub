
export type CategoryAssignment = 'all' | 'sectors' | 'schools';
export type CategoryStatus = 'active' | 'inactive' | 'archived' | 'draft' | 'approved' | 'pending' | 'completed';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: CategoryStatus;
  assignment: CategoryAssignment;
  created_at?: string;
  updated_at?: string;
  archived?: boolean;
  priority?: number;
  deadline?: string | Date | null;
  column_count?: number;
  completionRate?: number;
  columns?: ColumnData[];
}

export interface ColumnData {
  id: string;
  name: string;
  type: string;
  is_required: boolean;
  options?: any;
  validation?: any;
  help_text?: string;
  placeholder?: string;
  category_id: string;
  order_index?: number;
  status?: string;
}

export interface CategoryWithColumns extends Category {
  columns: ColumnData[];
}

export interface FormCategory extends Category {
  completionRate?: number;
}

export interface CategoryFilter {
  search?: string;
  status?: string[] | string;
  assignment?: string[] | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  archived?: boolean;
}

export interface TabDefinition {
  id: string;
  label: string;
  status?: CategoryStatus | 'all';
  count?: number;
  columns?: any[];
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

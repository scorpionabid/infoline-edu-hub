
export type CategoryStatus = 'active' | 'inactive' | 'archived';
export type CategoryAssignment = 'all' | 'sectors' | 'specific';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: CategoryStatus;
  assignment: CategoryAssignment;
  priority: number;
  archived: boolean;
  column_count: number;
  order?: number;
  deadline?: string | null;
  created_at?: string;
  updated_at?: string;
  createdAt?: string; // uyğunluq üçün əlavə edildi
  updatedAt?: string; // uyğunluq üçün əlavə edildi
}

export interface CategoryWithOrder extends Category {
  order: number;
}

export interface CategoryWithColumns {
  category: Category;
  columns: import('@/types/column').Column[];
  id?: string; // CategoryWithColumns.id üçün əlavə edildi
  name?: string; // CategoryWithColumns.name üçün əlavə edildi
  deadline?: string;
}

// Supabase-dən gələn kateqoriya obyektini Category tipinə çevirmək üçün adapter
export const adaptSupabaseCategory = (category: any): Category => {
  return {
    id: category.id || '',
    name: category.name || '',
    description: category.description || '',
    status: (category.status as CategoryStatus) || 'active',
    assignment: (category.assignment as CategoryAssignment) || 'all',
    priority: category.priority || 0,
    archived: category.archived || false,
    column_count: category.column_count || 0,
    order: category.order || category.priority || 0,
    deadline: category.deadline || null,
    created_at: category.created_at,
    updated_at: category.updated_at,
    createdAt: category.createdAt || category.created_at,
    updatedAt: category.updatedAt || category.updated_at
  };
};

// Kateqoriya süzgəci üçün tipi əlavə edirik
export interface CategoryFilter {
  status: string;
  assignment: 'all' | 'sectors' | '';
  archived: boolean;
  showArchived?: boolean;
  search?: string;
}

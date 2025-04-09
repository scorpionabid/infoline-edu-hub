
export type CategoryStatus = 'active' | 'inactive' | 'draft';
export type FormStatus = 'pending' | 'approved' | 'rejected' | 'draft';

export interface Category {
  id: string;
  name: string;
  description: string;
  assignment: 'sectors' | 'all';
  deadline?: string;
  status: CategoryStatus;
  priority: number;
  created_at: string;
  updated_at: string;
  archived?: boolean;
  column_count?: number;
}

export interface CategoryFilter {
  status: CategoryStatus | 'all';
  assignment: 'sectors' | 'all' | '';
  deadline: 'all' | 'upcoming' | 'past' | '';
}

// Supabase-dən gələn məlumatları Category tipinə çevirmək üçün adapter
export const adaptSupabaseCategory = (data: any): Category => {
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    assignment: data.assignment as 'sectors' | 'all',
    deadline: data.deadline,
    status: data.status as CategoryStatus,
    priority: data.priority || 0,
    created_at: data.created_at,
    updated_at: data.updated_at,
    archived: data.archived || false,
    column_count: data.column_count || 0
  };
};

// Category tipini Supabase formatına çevirmək üçün adapter
export const adaptCategoryToSupabase = (category: Category): any => {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    assignment: category.assignment,
    deadline: category.deadline,
    status: category.status,
    priority: category.priority,
    created_at: category.created_at,
    updated_at: category.updated_at,
    archived: category.archived || false,
    column_count: category.column_count || 0
  };
};

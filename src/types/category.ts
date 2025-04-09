
export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors';
  deadline?: string;
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  created_at: string;
  updated_at: string;
  archived?: boolean;
  column_count?: number;
}

export type CategoryStatus = 'active' | 'inactive' | 'draft';
export type FormStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'dueSoon' | 'overdue' | 'draft';

export interface CategoryFilter {
  status?: CategoryStatus | 'all';
  assignment?: 'all' | 'sectors';
  deadline?: 'all' | 'upcoming' | 'past';
}

// Supabase ilə uyğunlaşdırma funksiyaları
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

export const adaptCategoryToSupabase = (category: Partial<Category>): any => {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    assignment: category.assignment,
    deadline: category.deadline,
    status: category.status,
    priority: category.priority,
    archived: category.archived,
    column_count: category.column_count,
    created_at: category.created_at,
    updated_at: category.updated_at
  };
};


import { Column } from '@/types/column';

export type CategoryStatus = 'active' | 'inactive' | 'draft' | 'archived';

export interface Category {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  priority?: number;
  status?: string;
  created_at: string;
  updated_at: string;
  assignment?: string;
  column_count?: number;
  archived?: boolean;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
}

// Supabase-dən gələn kateqoriya məlumatlarını modelə çevirmək üçün adapter
export const adaptSupabaseCategory = (data: any): Category => {
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    deadline: data.deadline,
    priority: data.priority || 0,
    status: data.status || 'active',
    created_at: data.created_at,
    updated_at: data.updated_at,
    assignment: data.assignment || 'all',
    column_count: data.column_count || 0,
    archived: data.archived || false
  };
};

// Modeldən Supabase-ə göndəriləcək formatı çevirmək üçün adapter
export const adaptCategoryToSupabase = (category: Partial<Category>): any => {
  return {
    ...category,
    // Əlavə konversiyalar lazım olarsa burada edilə bilər
  };
};

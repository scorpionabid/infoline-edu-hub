
import { Column } from './schema';

export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft'
}

export enum FormStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SAVING = 'saving',
  ERROR = 'error',
  SUCCESS = 'success'
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  status?: CategoryStatus | string;
  assignment?: 'all' | 'sectors' | string;
  deadline?: string;
  created_at?: string;
  updated_at?: string;
  priority?: number;
  archived?: boolean;
  column_count?: number;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
  columnCount?: number;
}

export interface CategoryFilter {
  status: 'all' | CategoryStatus;
  assignment: 'all' | 'sectors';
  deadline: 'all' | 'upcoming' | 'past';
}

// Supabase-dən gələn datanı tiplərə uyğunlaşdırmaq üçün adapter funksiyaları
export const adaptSupabaseCategory = (dbCategory: any): Category => {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    description: dbCategory.description || '',
    status: dbCategory.status || CategoryStatus.ACTIVE,
    deadline: dbCategory.deadline || null,
    assignment: dbCategory.assignment || 'all',
    column_count: dbCategory.column_count || 0,
    archived: dbCategory.archived || false,
    priority: dbCategory.priority || 0,
    created_at: dbCategory.created_at,
    updated_at: dbCategory.updated_at
  };
};

// Forma məlumatlarını verilənlər bazası formatına çevirmək üçün
export const adaptCategoryToSupabase = (category: Category): any => {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    status: category.status || CategoryStatus.ACTIVE,
    deadline: category.deadline,
    assignment: category.assignment || 'all',
    priority: category.priority || 0,
    column_count: category.column_count || 0,
    archived: category.archived || false
  };
};

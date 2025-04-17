
import { Column } from './column'; 
import { Json } from '@/integrations/supabase/types';

// Category status tipi
export type CategoryStatus = 'active' | 'inactive' | 'draft' | 'archived';

// Əsas Category interfeysi
export interface Category {
  id: string;
  name: string;
  description: string;
  assignment: 'all' | 'sectors';
  deadline: string | null;
  status: CategoryStatus;
  priority: number;
  created_at: string;
  updated_at: string;
  column_count?: number;
  archived?: boolean;
  completionPercentage?: number;
}

// Sütunları olan kateqoriya interfeysi
export interface CategoryWithColumns extends Category {
  columns: Column[];
  completionPercentage: number;
}

// Kateqoriya filtri üçün interfeys
export interface CategoryFilter {
  status: string[];
  assignment: string[];
  search: string;
}

// Supabase-dən gələn məlumatları Category tipinə çevirmək üçün funksiya
export const adaptSupabaseCategory = (dbData: any): Category => {
  return {
    id: dbData.id,
    name: dbData.name,
    description: dbData.description || '',
    assignment: dbData.assignment || 'all',
    deadline: dbData.deadline,
    status: dbData.status || 'active',
    priority: dbData.priority || 0,
    created_at: dbData.created_at,
    updated_at: dbData.updated_at,
    column_count: dbData.column_count || 0,
    archived: dbData.archived || false,
    completionPercentage: dbData.completionPercentage || 0
  };
};

// Category tipindən Supabase-ə göndərmək üçün funksiya
export const adaptCategoryToSupabase = (category: Category): Record<string, any> => {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    assignment: category.assignment,
    deadline: category.deadline,
    status: category.status,
    priority: category.priority,
    column_count: category.column_count || 0,
    archived: category.archived || false,
  };
};

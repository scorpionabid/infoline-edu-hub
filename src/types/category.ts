
export type CategoryStatus = 'active' | 'inactive' | 'draft' | 'archived';
export type CategoryAssignment = 'all' | 'sectors';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status?: CategoryStatus;
  deadline?: string;
  assignment?: CategoryAssignment;
  column_count?: number;
  archived?: boolean;
  priority?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
  columnCount?: number;
}

// Adapter funksiyası əlavə edək
export const adaptSupabaseCategory = (data: any): Category => {
  return {
    id: data.id,
    name: data.name,
    description: data.description || "",
    status: data.status || "active",
    deadline: data.deadline,
    assignment: data.assignment || "all",
    column_count: data.column_count || 0,
    archived: data.archived || false,
    priority: data.priority || 0,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const adaptCategoryToSupabase = (category: Category): any => {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    status: category.status,
    deadline: category.deadline,
    assignment: category.assignment,
    priority: category.priority,
    archived: category.archived,
    column_count: category.column_count,
    created_at: category.created_at,
    updated_at: category.updated_at
  };
};

// Tip uyğunluğunu təmin etmək üçün Column tipinə istinad
import { Column } from './column';

// Filtrlər üçün tip
export interface CategoryFilter {
  status: string;
  assignment: string;
  deadline: string;
}

// Form statusu
export type FormStatus = 'idle' | 'loading' | 'success' | 'error';

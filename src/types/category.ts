
export type CategoryAssignment = 'all' | 'sectors';
export type CategoryStatus = 'active' | 'inactive' | 'archived';

export interface Category {
  id: string;
  name: string;
  description: string;
  assignment: CategoryAssignment;
  status: CategoryStatus;
  deadline?: string;
  archived: boolean;
  priority: number;
  column_count: number;
  createdAt?: string;
  updatedAt?: string;
  order?: number; // Daha çox əvvəlki müqayisə üçün əlavə olunur
}

export interface CategoryFilter {
  status?: CategoryStatus;
  assignment?: CategoryAssignment;
  search?: string;
  archived?: boolean;
}

// MockCategory tipini əlavə edirik
export interface MockCategory extends Category {
  completionRate?: number;
  columnCount?: number;
}

// Supabase category-ni adaptasiya etmək üçün funksiya
export const adaptSupabaseCategory = (category: any): Category => {
  return {
    id: category.id,
    name: category.name,
    description: category.description || "",
    assignment: category.assignment || "all",
    status: category.status || "active",
    deadline: category.deadline,
    archived: category.archived || false,
    priority: category.priority || 0,
    column_count: category.column_count || 0,
    createdAt: category.created_at,
    updatedAt: category.updated_at,
    order: category.order_index || 0,
  };
};

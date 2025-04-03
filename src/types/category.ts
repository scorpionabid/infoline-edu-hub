
export type CategoryAssignment = 'all' | 'sectors';

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: CategoryAssignment;
  status: 'active' | 'inactive' | 'archived';
  priority?: number;
  column_count?: number;
  deadline?: string;
  createdAt?: string;
  updatedAt?: string;
  archived?: boolean;
  // Supabase verilənlər bazası ilə uyğunluq üçün əlavə edildi
  order?: number;
}

// Kateqoriyanı sıralama ilə birlikdə göstərmək üçün genişlənmiş tip
export interface CategoryWithOrder extends Category {
  order?: number;
}

// Bu tip mock data üçün istifadə olunur
export interface MockCategory extends Category {
  columnCount?: number;
  completionRate?: number;
}

// Supabase-dən gələn kateqoriya obyektini uyğunlaşdırmaq üçün adapter funksiya
export const adaptSupabaseCategory = (data: any): Category => {
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    assignment: data.assignment as CategoryAssignment,
    status: data.status || 'active',
    priority: data.priority || 0,
    column_count: data.column_count || 0,
    deadline: data.deadline,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    archived: data.archived || false,
    order: data.order || data.priority || 0
  };
};

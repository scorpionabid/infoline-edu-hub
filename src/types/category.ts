
export type CategoryStatus = 'active' | 'inactive' | 'archived';
export type CategoryAssignment = 'all' | 'sectors' | 'schools';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: CategoryStatus;
  assignment: CategoryAssignment;
  priority: number;
  archived: boolean;
  column_count: number;
  deadline?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryWithOrder extends Category {
  order?: number;
}

/**
 * Verilənlər bazasından gələn kateqoriya məlumatlarını tətbiq formatına çevirir
 * @param dbData Supabase-dən gələn kateqoriya məlumatı
 * @returns Kateqoriya obyekti
 */
export function adaptSupabaseCategory(dbData: any): CategoryWithOrder {
  return {
    id: dbData.id || '',
    name: dbData.name || '',
    description: dbData.description || '',
    status: adaptCategoryStatus(dbData.status || ''),
    assignment: adaptCategoryAssignment(dbData.assignment || ''),
    priority: dbData.priority || 0,
    archived: dbData.archived || false,
    column_count: dbData.column_count || 0,
    deadline: dbData.deadline || undefined,
    created_at: dbData.created_at || new Date().toISOString(),
    updated_at: dbData.updated_at || new Date().toISOString(),
    order: dbData.order || dbData.priority || 0
  };
}

// Status və Assignment adapter funksiyaları
function adaptCategoryStatus(status: string): CategoryStatus {
  switch(status.toLowerCase()) {
    case 'active':
      return 'active';
    case 'inactive':
      return 'inactive';
    case 'archived':
      return 'archived';
    default:
      return 'active';
  }
}

function adaptCategoryAssignment(assignment: string): CategoryAssignment {
  switch(assignment.toLowerCase()) {
    case 'all':
      return 'all';
    case 'sectors':
      return 'sectors';
    case 'schools':
      return 'schools';
    default:
      return 'all';
  }
}

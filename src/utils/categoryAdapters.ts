
import { Category, CategoryAssignment, CategoryStatus, CategoryWithOrder } from "@/types/category";

/**
 * Supabase kateqoriya obyektindən front-end kateqoriya obyektinə çevirir
 * @param dbData Verilənlər bazasından gələn kateqoriya məlumatı
 * @returns Frontend üçün hazırlanmış kateqoriya obyekti
 */
export function adaptSupabaseCategoryData(dbData: any): Category {
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
    created_at: dbData.created_at,
    updated_at: dbData.updated_at
  };
}

/**
 * Kategoriyanı Supabase formatına çevirmək
 * @param category Kateqoriya obyekti
 * @returns Supabase formatında kateqoriya
 */
export function prepareCategoryForSupabase(category: Partial<CategoryWithOrder>): any {
  return {
    name: category.name,
    description: category.description,
    status: category.status,
    assignment: category.assignment,
    priority: category.priority || 0,
    archived: category.archived || false,
    deadline: category.deadline ? (typeof category.deadline === 'object' ? 
      (category.deadline as Date).toISOString() : category.deadline) : null
  };
}

// Status dəyişənini CategoryStatus tipinə çevirmək
export function adaptCategoryStatus(status: string): CategoryStatus {
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

// Assignment dəyişənini CategoryAssignment tipinə çevirmək
export function adaptCategoryAssignment(assignment: string): CategoryAssignment {
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

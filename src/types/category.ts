
export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment?: string;
  priority?: number;
  deadline?: string | Date;
  status?: string;
  columnCount?: number;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

// Supabase-dən gələn kateqoriya datasını tətbiqin daxilindəki Category tipinə çevirir
export const adaptSupabaseCategory = (supabaseCategory: any): Category => {
  return {
    id: supabaseCategory.id,
    name: supabaseCategory.name,
    description: supabaseCategory.description || '',
    assignment: supabaseCategory.assignment || 'all',
    priority: supabaseCategory.priority || 0,
    deadline: supabaseCategory.deadline || null,
    status: supabaseCategory.status || 'active',
    columnCount: supabaseCategory.column_count || 0,
    order: supabaseCategory.order || 0,
    createdAt: supabaseCategory.created_at,
    updatedAt: supabaseCategory.updated_at
  };
};

// Tətbiqdəki Category tipindən Supabase formatına çevirir
export const adaptCategoryToSupabase = (category: Partial<Category>): Record<string, any> => {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    assignment: category.assignment,
    priority: category.priority,
    deadline: category.deadline,
    status: category.status,
    column_count: category.columnCount,
    order: category.order,
    // created_at və updated_at avtomatik idarə olunur
  };
};

// Kateqoriya filtri tipi
export interface CategoryFilter {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  assignment?: 'all' | 'sectors';
  sort?: 'name' | 'priority' | 'created' | 'updated';
  sortDirection?: 'asc' | 'desc';
}

// Mock kateqoriya tipi, sadəcə test məlumatları üçün
export interface MockCategory extends Category {
  columns?: number;
  lastUpdated?: string;
}

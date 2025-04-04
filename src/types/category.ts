
// Category tipi
export interface Category {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  deadline?: string;
  assignment: 'all' | 'sectors';
  createdAt: string;
  updatedAt: string;
  columnCount?: number;
  archived: boolean;
}

// Kateqoriya filtri
export interface CategoryFilter {
  status?: 'active' | 'inactive' | 'draft';
  assignment?: 'all' | 'sectors';
  search?: string;
  showArchived?: boolean;
}

// Supabase-dən gələn kateqoriya məlumatlarını adaptasiya et
export const adaptSupabaseCategory = (supabaseCategory: any): Category => {
  return {
    id: supabaseCategory.id,
    name: supabaseCategory.name,
    description: supabaseCategory.description || '',
    status: supabaseCategory.status || 'active',
    priority: supabaseCategory.priority || 0,
    deadline: supabaseCategory.deadline,
    assignment: supabaseCategory.assignment || 'all',
    createdAt: supabaseCategory.created_at,
    updatedAt: supabaseCategory.updated_at,
    columnCount: supabaseCategory.column_count || 0,
    archived: supabaseCategory.archived || false
  };
};

// Kateqoriyaları Supabase formatına çevirmək
export const adaptCategoryToSupabase = (category: Partial<Category>): any => {
  const {
    createdAt,
    updatedAt,
    columnCount,
    ...rest
  } = category;

  return {
    ...rest,
    created_at: createdAt,
    updated_at: updatedAt,
    column_count: columnCount,
  };
};


// Category tipləri

export interface Category {
  id: string;
  name: string;
  assignment: 'all' | 'sectors';
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  description?: string;
  columnCount?: number;
  archived: boolean;
}

export interface CategoryFilter {
  status: 'all' | 'active' | 'inactive';
  assignment: 'all' | 'allOnly' | 'sectorsOnly';
  search: string;
}

export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  allAssignment: number;
  sectorsAssignment: number;
}

// Supabase-dən gələn datanı Category formatına çevirmək üçün adapter
export const adaptSupabaseCategory = (data: any): Category => {
  return {
    id: data.id || '',
    name: data.name || '',
    assignment: data.assignment || 'all',
    createdAt: data.created_at || new Date().toISOString(),
    updatedAt: data.updated_at || new Date().toISOString(),
    status: data.status || 'draft',
    priority: data.priority || 0,
    description: data.description || '',
    columnCount: data.column_count || 0,
    archived: data.archived || false
  };
};

// Category-ni Supabase formatına çevirmək üçün adapter
export const adaptCategoryToSupabase = (category: Partial<Category>): any => {
  return {
    id: category.id,
    name: category.name,
    assignment: category.assignment,
    created_at: category.createdAt,
    updated_at: new Date().toISOString(),
    status: category.status,
    priority: category.priority,
    description: category.description,
    column_count: category.columnCount,
    archived: category.archived
  };
};

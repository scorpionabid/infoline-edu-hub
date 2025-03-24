
export type CategoryStatus = 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'dueSoon' | 'overdue';

export interface Category {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  status: CategoryStatus | string;
  priority?: number; // optional olmalıdır
  assignment?: 'all' | 'sectors';
  createdAt?: string;
  updatedAt?: string;
  columnCount?: number; // column_count uyğun olaraq əlavə edildi
  archived?: boolean;
}

export interface CategoryWithProgress extends Category {
  completionPercentage?: number;
  entryCount?: number;
  completedEntryCount?: number;
  rejectedEntryCount?: number;
}

export interface CategoryFilter {
  status?: string;
  assignment?: 'all' | 'sectors';
  search?: string;
  showArchived?: boolean;
}

// Supabase Category tipini Category tipinə çevirmək üçün adapter
export const adaptSupabaseCategory = (supabaseCategory: any): Category => {
  return {
    id: supabaseCategory.id,
    name: supabaseCategory.name,
    description: supabaseCategory.description,
    deadline: supabaseCategory.deadline,
    status: supabaseCategory.status,
    priority: supabaseCategory.priority,
    assignment: supabaseCategory.assignment,
    createdAt: supabaseCategory.created_at,
    updatedAt: supabaseCategory.updated_at,
    columnCount: supabaseCategory.column_count,
    archived: supabaseCategory.archived
  };
};

// Category tipini Supabase Category tipinə çevirmək üçün adapter
export const adaptCategoryToSupabase = (category: Partial<Category>): any => {
  return {
    name: category.name,
    description: category.description,
    deadline: category.deadline,
    status: category.status,
    priority: category.priority || 0, // default dəyər təyin edirik
    assignment: category.assignment,
    archived: category.archived
  };
};

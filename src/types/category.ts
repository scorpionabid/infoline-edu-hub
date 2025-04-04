// Kategoriya status tipi
export type CategoryStatus = 'active' | 'inactive' | 'draft';

// Kategoriya modeli
export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment?: 'all' | 'sectors';
  status: CategoryStatus;
  deadline?: string;
  priority?: number;
  columnCount?: number;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

// Kategoriya filtirləməsi üçün model
export interface CategoryFilter {
  search?: string;
  status?: CategoryStatus | 'all';
  assignment?: 'all' | 'sectors' | '';
  deadline?: 'upcoming' | 'past' | 'all' | '';
}

// Form status tipi
export type FormStatus = 'completed' | 'pending' | 'rejected' | 'dueSoon' | 'overdue' | 'draft' | 'approved';

// Form elementləri üçün model
export interface FormItem {
  id: string;
  title: string;
  description?: string;
  status: FormStatus;
  deadline?: string;
  completedAt?: string;
  rejectionReason?: string;
}

// Supabase adapterləri
export const adaptSupabaseCategory = (supabaseCategory: any): Category => {
  return {
    id: supabaseCategory.id,
    name: supabaseCategory.name,
    description: supabaseCategory.description,
    assignment: supabaseCategory.assignment || 'all',
    status: supabaseCategory.status as CategoryStatus,
    deadline: supabaseCategory.deadline,
    priority: supabaseCategory.priority,
    columnCount: supabaseCategory.column_count,
    createdAt: supabaseCategory.created_at,
    updatedAt: supabaseCategory.updated_at,
    archived: supabaseCategory.archived || false
  };
};

export const adaptCategoryToSupabase = (category: Category): any => {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    assignment: category.assignment,
    status: category.status,
    deadline: category.deadline,
    priority: category.priority,
    column_count: category.columnCount,
    created_at: category.createdAt,
    updated_at: category.updatedAt,
    archived: category.archived
  };
};

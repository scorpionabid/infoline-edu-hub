
export type CategoryAssignment = 'all' | 'sectors';

export interface Category {
  id: string;
  name: string;
  description: string;
  assignment: CategoryAssignment;
  status: string;
  deadline?: string | null;
  archived: boolean;
  priority: number;
  order: number;
  columnCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryWithOrder extends Category {
  // CategoryWithOrder artıq Category interfeysindən miras alır və order xüsusiyyətinə malik olur
}

export interface CategoryFilter {
  assignment: 'all' | 'sectors' | '';
  status: string;
  archived: boolean;
  showArchived?: boolean;
  search?: string;
}

export interface CategoryWithColumns {
  category: Category;
  columns: Column[];
}

export type ColumnType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'image' | string;

export interface ColumnOption {
  label: string;
  value: string;
}

export interface ColumnValidation {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  customMessage?: string;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  categoryId: string;
  isRequired: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string;
  orderIndex: number;
  order?: number;
  options: string[] | ColumnOption[];
  status: string;
  parentColumnId?: string;
  dependsOn?: string;
  validation?: ColumnValidation;
}

export const adaptCategory = (rawData: any): Category => {
  return {
    id: rawData.id || '',
    name: rawData.name || '',
    description: rawData.description || '',
    assignment: rawData.assignment || 'all',
    status: rawData.status || 'active',
    deadline: rawData.deadline || null,
    archived: rawData.archived || false,
    priority: rawData.priority || 0,
    order: rawData.order || rawData.priority || 0,
    columnCount: rawData.column_count || 0,
    createdAt: rawData.created_at,
    updatedAt: rawData.updated_at
  };
};

export const adaptCategoryToApi = (category: Category) => {
  return {
    name: category.name,
    description: category.description,
    assignment: category.assignment,
    status: category.status,
    deadline: category.deadline,
    archived: category.archived,
    priority: category.priority,
    column_count: category.columnCount,
    updated_at: new Date().toISOString()
  };
};

// Supabase-dən gələn category məlumatlarını frontend modelinə çevirən adapter
export const adaptSupabaseCategory = (rawData: any): Category => {
  return {
    id: rawData.id || '',
    name: rawData.name || '',
    description: rawData.description || '',
    assignment: rawData.assignment || 'all',
    status: rawData.status || 'active',
    deadline: rawData.deadline || null,
    archived: rawData.archived || false,
    priority: rawData.priority || 0,
    order: rawData.order || rawData.order_index || rawData.priority || 0,
    columnCount: rawData.column_count || 0,
    createdAt: rawData.created_at,
    updatedAt: rawData.updated_at
  };
};

export interface MockCategory extends Category {
  completionRate?: number;
}

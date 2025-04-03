
export type CategoryAssignment = 'all' | 'sectors' | string;

export interface Category {
  id: string;
  name: string;
  description: string;
  assignment: CategoryAssignment;
  status: string;
  deadline?: string;
  archived: boolean;
  priority: number;
  order: number;
  columnCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export const adaptCategory = (rawData: any): Category => {
  return {
    id: rawData.id || '',
    name: rawData.name || '',
    description: rawData.description || '',
    assignment: rawData.assignment || 'all',
    status: rawData.status || 'active',
    deadline: rawData.deadline || undefined,
    archived: rawData.archived || false,
    priority: rawData.priority || 0,
    order: rawData.priority || 0,
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

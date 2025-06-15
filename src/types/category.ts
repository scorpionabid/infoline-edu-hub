
export type CategoryStatus = 'active' | 'inactive' | 'draft' | 'approved' | 'archived';
export type CategoryAssignment = 'all' | 'schools' | 'sectors';

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: CategoryAssignment;
  status: CategoryStatus;
  deadline?: string;
  priority?: number;
  order_index?: number;
  column_count?: number;
  archived?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddCategoryFormData {
  name: string;
  description?: string;
  assignment: string;
  status: CategoryStatus;
  priority: number;
  deadline?: string | null;
  order_index?: number; // Add this field
}

export interface CreateCategoryFormData extends AddCategoryFormData {
  created_at?: string;
  updated_at?: string;
}

export interface UpdateCategoryFormData extends Partial<AddCategoryFormData> {
  id: string;
  updated_at?: string;
}

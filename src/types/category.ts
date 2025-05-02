
export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: CategoryAssignment;
  status: CategoryStatus;
  priority?: number;
  deadline?: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
}

export type CategoryAssignment = 'all' | 'sectors';
export type CategoryStatus = 'active' | 'inactive' | 'draft';

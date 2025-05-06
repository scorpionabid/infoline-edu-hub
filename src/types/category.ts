
export type CategoryStatus = 'active' | 'inactive' | 'archived' | 'approved' | 'draft';

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment?: string;
  status: CategoryStatus;
  priority?: number;
  created_at: string;
  updated_at: string;
  archived?: boolean;
  column_count?: number;
  deadline?: string;
  completionRate?: number;
}

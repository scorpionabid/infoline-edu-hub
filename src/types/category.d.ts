
export type CategoryStatus = 'active' | 'inactive' | 'draft';

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment?: 'sectors' | 'all';
  deadline?: string | Date;
  status: CategoryStatus;
  priority?: number;
  created_at: string;
  updated_at: string;
  archived?: boolean;
  column_count?: number;
}

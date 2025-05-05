
import { Column } from './column';

export type CategoryStatus = 'active' | 'inactive' | 'draft' | 'approved' | 'rejected' | 'pending' | 'due' | 'overdue';
export type CategoryAssignment = 'all' | 'sectors';

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment?: CategoryAssignment;
  deadline?: string;
  status?: CategoryStatus;
  priority?: number;
  created_at?: string;
  updated_at?: string;
  archived?: boolean;
  column_count?: number;
  completionRate?: number;
}

// CategoryWithColumns artıq column.ts faylında təyin edilib

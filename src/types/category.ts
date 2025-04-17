
import { Column } from './column'; 

export type CategoryStatus = 'active' | 'inactive' | 'draft' | 'archived';

export interface Category {
  id: string;
  name: string;
  description: string;
  assignment: 'all' | 'sectors';
  deadline: string | null;
  status: CategoryStatus;
  priority: number;
  created_at: string;
  updated_at: string;
  column_count?: number;
  archived?: boolean;
  completionPercentage?: number;
  columns?: Column[];
}

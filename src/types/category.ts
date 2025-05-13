
import { Column } from './column';

export type CategoryStatus = 'draft' | 'published' | 'archived';
export type CategoryAssignment = 'region' | 'sector' | 'school' | string | null;

export interface Category {
  id: string;
  name: string;
  description: string;
  status: CategoryStatus;
  icon?: string;
  color?: string;
  deadline?: string;
  archived: boolean | null;
  created_at: string;
  updated_at: string;
  assignment: CategoryAssignment;
  region_id?: string;
  sector_id?: string;
  column_count?: number;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
  columnCount: number;
}

export interface CategoryFormData {
  name: string;
  description: string;
  status: CategoryStatus;
  icon?: string;
  color?: string;
  deadline?: string;
  archived?: boolean;
  assignment?: CategoryAssignment;
  region_id?: string;
  sector_id?: string;
}

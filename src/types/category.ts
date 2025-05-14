
import { Column } from './column';

export type CategoryStatus = 'active' | 'inactive' | 'archived' | 'draft' | 'approved' | 'pending';
export type CategoryAssignment = 'all' | 'sectors' | 'schools' | 'region' | 'sector' | 'school' | string | null;

export interface TabDefinition {
  id: string;
  label: string;
  columns?: Column[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: CategoryStatus;
  icon?: string;
  color?: string;
  deadline?: string | null;
  archived: boolean | null;
  created_at: string;
  updated_at: string;
  assignment: CategoryAssignment;
  region_id?: string;
  sector_id?: string;
  column_count?: number;
  priority?: number;
  completionRate?: number;
}

export interface CategoryWithColumns extends Category {
  columns: Column[];
  columnCount: number;
  completionRate?: number;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  status: CategoryStatus;
  icon?: string;
  color?: string;
  deadline?: string | null;
  archived?: boolean;
  assignment?: CategoryAssignment;
  region_id?: string;
  sector_id?: string;
  priority?: number;
}

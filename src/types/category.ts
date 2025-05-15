
export type CategoryStatus = 'active' | 'inactive' | 'draft' | 'archived' | 'approved';
export type CategoryAssignment = 'all' | 'sectors' | 'schools';

export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment?: CategoryAssignment;
  status?: CategoryStatus;
  priority?: number;
  deadline?: string | null;
  updated_at: string;
  created_at?: string;
  archived?: boolean;
  column_count?: number;
  completionRate?: number; // Added for UI components
}

export interface TabDefinition {
  id: string;
  title: string;
  columns?: any[];
}

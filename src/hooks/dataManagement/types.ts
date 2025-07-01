
// Types for data management hooks
export type DataManagementStep = 'category' | 'column' | 'data';

export interface SchoolDataEntry {
  id: string;
  school_id: string;
  school_name: string;
  category_id: string;
  column_id: string;
  value: string;
  status: 'empty' | 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface DataStats {
  totalSchools: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  emptyCount: number;
  completionRate: number;
  totalEntries: number;
  completedEntries: number;
  pendingEntries: number;
}

export interface LoadingStates {
  categories: boolean;
  columns: boolean;
  schoolData: boolean;
  saving: boolean;
}


export interface DataEntry {
  id: string;
  category_id: string;
  school_id: string;
  column_id?: string;
  value: any;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  created_by?: string;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  metadata?: Record<string, any>;
}

export interface DataEntryFilter {
  category_id?: string;
  school_id?: string;
  status?: string[];
  date_from?: string;
  date_to?: string;
}

export interface DataEntryStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  completion_rate: number;
}

// Add missing types
export type DataEntryStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface DataEntryFormData {
  [key: string]: any;
}

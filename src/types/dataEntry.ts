
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

// Status constants for use in components
export const DATA_ENTRY_STATUS = {
  DRAFT: 'draft' as const,
  PENDING: 'pending' as const,
  APPROVED: 'approved' as const,
  REJECTED: 'rejected' as const
};

export const DATA_ENTRY_STATUS_TRANSITIONS = {
  [DATA_ENTRY_STATUS.DRAFT]: [DATA_ENTRY_STATUS.PENDING],
  [DATA_ENTRY_STATUS.PENDING]: [DATA_ENTRY_STATUS.APPROVED, DATA_ENTRY_STATUS.REJECTED],
  [DATA_ENTRY_STATUS.APPROVED]: [],
  [DATA_ENTRY_STATUS.REJECTED]: [DATA_ENTRY_STATUS.PENDING]
};

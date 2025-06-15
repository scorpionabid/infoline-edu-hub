
export type DataEntryStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'requires_revision';

export interface DataEntry {
  id: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value: string;
  status: DataEntryStatus;
  created_by?: string;
  approved_by?: string;
  rejected_by?: string;
  approval_comment?: string;
  rejection_reason?: string;
  proxy_created_by?: string;
  proxy_reason?: string;
  proxy_original_entity?: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  rejected_at?: string;
  deleted_at?: string;
}

export interface DataEntryFormData {
  school_id: string;
  category_id: string;
  column_id: string;
  value: string;
  status?: DataEntryStatus;
  created_by?: string;
  proxy_created_by?: string;
  proxy_reason?: string;
  proxy_original_entity?: string;
}

export interface SaveResult {
  success: boolean;
  error?: string;
  savedCount: number;
}

export interface DataEntryTableData {
  columns: import('./column').Column[];
  values: Record<string, any>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Export enum values for runtime usage
export const DataEntryStatusEnum = {
  DRAFT: 'draft' as const,
  PENDING: 'pending' as const,
  APPROVED: 'approved' as const,
  REJECTED: 'rejected' as const,
  REQUIRES_REVISION: 'requires_revision' as const
} as const;

export const DATA_ENTRY_STATUSES: DataEntryStatus[] = ['draft', 'pending', 'approved', 'rejected', 'requires_revision'];

export const DATA_ENTRY_STATUS_MAP: Record<DataEntryStatus, string> = {
  'draft': 'Qaralama',
  'pending': 'Gözləyir',
  'approved': 'Təsdiqlənib',
  'rejected': 'Rədd edilib',
  'requires_revision': 'Düzəliş tələb olunur'
};


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
  id: string;
  value: string;
  status: DataEntryStatus;
  column_name: string;
  created_at: string;
  created_by_name?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

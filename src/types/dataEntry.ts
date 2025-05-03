
export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  SUBMITTING = 'submitting',
  SUBMITTED = 'submitted',
  ERROR = 'error'
}

export interface EntryValue {
  columnId: string;
  categoryId?: string;
  value: string;
  name?: string;
  isValid?: boolean;
  error?: string;
}

export interface DataEntry {
  id: string;
  category_id: string;
  column_id: string;
  school_id: string;
  value: string;
  status: DataEntryStatus;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
}

export type DataEntryStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'incomplete';

export interface DataEntryValidation {
  isValid: boolean;
  errors: Record<string, string>;
}


export type DataEntryStatus = 'pending' | 'approved' | 'rejected';

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error'
}

export interface EntryValue {
  name: string;
  columnId: string;
  value: string;
  isValid: boolean;
  status?: DataEntryStatus;
  entryId?: string;
  error?: import('@/types/column').ColumnValidationError;
}

export interface DataEntry {
  id: string;
  column_id: string;
  category_id: string;
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

export interface DataEntryForm {
  categoryId: string;
  schoolId: string;
  entries: {
    name: string;
    columnId: string;
    value: string;
    isValid: boolean;
    status?: DataEntryStatus;
    entryId?: string;
  }[];
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

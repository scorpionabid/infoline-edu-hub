
export interface EntryValue {
  name: string;
  value: string;
  columnId: string;
  isValid: boolean;
  touched?: boolean;
  status?: string;
  entryId?: string;
  error?: ColumnValidationError;
}

export interface DataEntry {
  id?: string;
  column_id: string;
  category_id: string;
  school_id: string;
  value: string;
  status: DataEntryStatus;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
  deleted_at?: string;
  version?: number;
}

export type DataEntryStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface ColumnValidationError {
  message: string;
  type: string;
}

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error'
}

export interface DataEntryForm {
  id?: string;
  categoryId: string;
  schoolId: string;
  entries: EntryValue[];
  status?: DataEntryStatus;
}

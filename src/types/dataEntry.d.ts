
export interface DataEntryForm {
  id?: string;
  categoryId: string;
  schoolId: string;
  entries: EntryValue[];
  status?: string;
  isModified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EntryValue {
  columnId: string;
  value: any;
  errorMessage?: string;
  warningMessage?: string;
}

export interface DataEntryRecord {
  id: string;
  categoryId: string;
  schoolId: string;
  columnId: string;
  value: any;
  status: string;
  createdAt: string;
  updatedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  categories?: {
    id?: string;
    name?: string;
  };
  columns?: {
    id?: string;
    name?: string;
  };
  schools?: any[];
  created_at?: string;
  created_by?: string;
  category_id?: string;
  column_id?: string;
  school_id?: string;
}

export interface ColumnValidationError {
  columnId: string;
  columnName?: string;
  message: string;
  severity?: 'error' | 'warning' | 'info';
  categoryId?: string;
}

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error',
  SUBMITTING = 'submitting',
  SUBMITTED = 'submitted'
}

export type DataEntryStatus = 'pending' | 'approved' | 'rejected' | 'draft';

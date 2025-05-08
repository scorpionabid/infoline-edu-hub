
export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error',
  SUBMITTING = 'submitting',
  SUBMITTED = 'submitted'
}

export type DataEntryStatus = 'pending' | 'approved' | 'rejected' | 'draft';

export interface EntryValue {
  id?: string;
  columnId: string; 
  value: any;
  status?: DataEntryStatus;
}

export interface DataEntryTableData {
  id: string;
  categoryId: string;
  columnId: string;
  schoolId: string;
  value: string;
  status: DataEntryStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  approvedBy?: string;
  rejectedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  columnName?: string;
  columnType?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface DataEntryFormData {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export interface DataEntryForm {
  id?: string;
  categoryId: string;
  schoolId: string;
  entries: EntryValue[];
}

export interface DataEntry {
  id?: string;
  column_id: string;
  category_id?: string;
  school_id?: string;
  value: any;
  status?: DataEntryStatus;
}

export interface BaseDataEntry {
  id: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value: any;
  status: DataEntryStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
}

export interface ColumnValue {
  columnId: string;
  value: any;
  columnType: string;
  isRequired: boolean;
  isValid: boolean;
  errorMessage?: string;
}

export interface CategoryEntryData {
  categoryId: string;
  entries: DataEntry[];
  status: DataEntryStatus;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
}

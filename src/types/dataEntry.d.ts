
export interface DataEntry {
  id: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value: any;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  approved_by: string;
  approved_at: string;
  rejected_by: string;
  rejection_reason: string;
}

export interface ColumnValue {
  columnId: string;
  value: any;
  columnType: string;
  isRequired: boolean;
  isValid: boolean;
  errorMessage?: string;
}

export interface DataEntryTableData {
  id: string;
  columnId: string;
  columnName: string;
  columnType: string;
  value: any;
  status: string;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export enum DataEntryStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DRAFT = 'draft'
}

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error',
  SUBMITTING = 'submitting',
  SUBMITTED = 'submitted'
}

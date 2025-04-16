export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error',
  SUBMITTED = 'submitted'
}

export interface EntryValue {
  id?: string;
  column_id: string;
  category_id: string;
  school_id: string;
  value: any;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface ColumnValidationError {
  field: string;
  message: string;
  type: string;
  severity?: 'warning' | 'error' | 'info';
}

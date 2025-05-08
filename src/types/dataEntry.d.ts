
export interface EntryValue {
  columnId: string;
  value: string | number | boolean | null;
}

export interface DataEntryForm {
  id?: string;
  categoryId: string;
  schoolId: string;
  status: DataEntryStatus;
  entries: EntryValue[];
  isModified?: boolean;
}

export type DataEntryStatus = 
  | 'draft' 
  | 'pending' 
  | 'approved' 
  | 'rejected'
  | 'incomplete';

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  SUBMITTING = 'submitting',
  SUBMITTED = 'submitted',
  ERROR = 'error'
}

export interface CategoryEntryData {
  id: string;
  name: string;
  completionRate: number;
  status: string;
  values: Array<{columnId: string; value: any}>;
}

export interface ColumnValidationError {
  columnId: string;
  columnName: string;
  errorMessage: string;
  severity: 'error' | 'warning';
}

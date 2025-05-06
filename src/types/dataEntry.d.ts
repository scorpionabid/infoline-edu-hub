
export type DataEntryStatus = 'pending' | 'approved' | 'rejected' | 'draft';
export type DataEntrySaveStatus = 'saving' | 'saved' | 'error' | null;

export interface DataEntry {
  id: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value: string;
  status: DataEntryStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
  column?: any;
}

export interface DataEntryTableData {
  columnName: string;
  columnId: string;
  value: string;
  status: DataEntryStatus;
  columnType: string;
  error?: string;
}

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error',
  SUBMITTING = 'submitting',
  SUBMITTED = 'submitted'
}

export interface EntryValue {
  [columnId: string]: string | boolean | number | Date | null;
}

export interface DataEntryForm {
  entries: DataEntry[];
  isModified: boolean;
  saveStatus: DataEntrySaveStatus;
  error: string | null;
  schoolId: string;
  categoryId: string;
  status: string;
  lastSaved?: string;
  submittedAt?: string;
}

export interface FormDeadline {
  id: string;
  title: string; 
  name: string;
  status: string;
  dueDate: string;
  createdAt: string;
  categoryName: string;
  completionRate: number;
}

export interface DataEntryFormProps {
  schoolId: string;
  categoryId: string;
  initialEntries?: DataEntry[];
  onComplete?: () => void;
}

export interface ColumnValue {
  columnId: string;
  value: string | boolean | number;
  columnType: string;
  isRequired: boolean;
  isValid: boolean;
  errorMessage?: string;
}

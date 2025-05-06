
import { Column } from './column';

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error',
  SUBMITTING = 'submitting',
  SUBMITTED = 'submitted'
}

export interface DataEntry {
  id?: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value: string;
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
  created_by?: string;
  approved_by?: string;
  rejected_by?: string;
  approval_date?: string;
  rejection_reason?: string;
  created_at?: string;
  updated_at?: string;
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
  dueDate: string;
  createdAt: string;
  categoryName: string;
  completionRate: number;
  status: string;
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

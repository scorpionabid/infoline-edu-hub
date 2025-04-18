
import { CategoryWithColumns } from './category';

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
  column_id: string;
  category_id: string;
  school_id: string;
  value: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
}

export interface DataEntryForm {
  entries: DataEntry[];
  isModified: boolean;
  saveStatus: DataEntrySaveStatus;
  error: string | null;
  schoolId?: string;
  categoryId?: string;
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  lastSaved?: string;
  completionPercentage?: number;
}

export interface CategoryEntryData {
  category: CategoryWithColumns;
  entries: DataEntry[];
  completionPercentage?: number;
}

export interface EntryValue {
  [columnId: string]: string | number | boolean | string[] | null;
}

export interface ColumnValidationError {
  columnId: string;
  message: string;
  columnName?: string;
}

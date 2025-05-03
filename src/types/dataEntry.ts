
import { Column } from './column';
import { Category } from './category';

export type DataEntryStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error',
  SUBMITTING = 'submitting',
  SUBMITTED = 'submitted'
}

// Data entry tipləri
export interface DataEntry {
  id: string;
  category_id: string;
  column_id: string;
  school_id: string;
  value: string;
  status: DataEntryStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
  approved_at?: string;
  approved_by?: string;
  rejected_by?: string;
  rejection_reason?: string;
}

export interface ColumnValidationError {
  message: string;
  type: 'error' | 'warning';
}

// Column validation interfeysi
export interface ColumnValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  customError?: string;
}

// Data entry form dəyərləri üçün tip
export interface EntryValue {
  columnId: string;
  categoryId?: string;
  value: string;
  name?: string;
  isValid?: boolean;
  error?: string;
  status?: DataEntryStatus;
  entryId?: string;
  id?: string;
}

// Data entry schema
export interface DataEntrySchema {
  categoryId: string;
  columns: Column[];
  entries: DataEntry[];
}

// Entry form data
export interface DataEntryForm {
  id?: string;
  categoryId: string;
  schoolId: string;
  entries: EntryValue[];
  status?: DataEntryStatus;
  submittedAt?: string;
  isModified?: boolean;
  saveStatus?: DataEntrySaveStatus;
  error?: string | null;
  lastSaved?: string;
}

// Category entry status
export type CategoryEntryStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'incomplete';

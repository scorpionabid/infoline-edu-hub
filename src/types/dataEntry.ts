
import { CategoryWithColumns } from '@/types/column';

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
}

export interface CategoryEntryData {
  category: CategoryWithColumns;
  entries: DataEntry[];
}

export interface EntryValue {
  [columnId: string]: string | number | boolean | string[] | null;
}

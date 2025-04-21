
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
  school_id: string;
  category_id: string;
  column_id: string;
  value: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
}

export interface CategoryEntryData {
  categoryId: string;
  values: Record<string, string>;
  modified: boolean;
}

export interface ColumnValidationError {
  field: string;
  columnId: string;
  type: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface EntryFormData {
  categories: CategoryWithColumns[];
  entries: DataEntry[];
  status: DataEntrySaveStatus;
  modified: boolean;
  errors: ColumnValidationError[];
  schoolId: string;
  categoryId?: string;
}

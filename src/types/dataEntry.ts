
import { Column } from './column';

export type DataEntryStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface ColumnEntry {
  id?: string;
  columnId: string;
  value: string | number | boolean | string[] | null;
  status?: string;
  validation?: any;
  errorMessage?: string;
}

export interface CategoryEntryData {
  columnId: string;
  value: string | number | boolean | string[] | null;
  status?: string;
  validation?: any;
  errorMessage?: string;
}

export interface DataEntryForm {
  categoryId: string;
  schoolId: string;
  entries: Record<string, ColumnEntry>;
  status: DataEntryStatus;
  hasUnsavedChanges: boolean;
  lastSaved: string;
  validationErrors: Record<string, string>;
  overallProgress?: number;
}

export interface DataEntry {
  id: string;
  category_id: string;
  column_id: string;
  school_id: string;
  value?: string;
  status?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
}


import { Column } from './column';

export type DataEntryStatus = 'pending' | 'approved' | 'rejected' | 'draft';

export interface DataEntryForm {
  id?: string;
  schoolId: string;
  categoryId: string;
  entries: DataEntryItem[];
  status?: DataEntryStatus;
  createdAt?: string;
  updatedAt?: string;
  submittedAt?: string;
  isModified?: boolean;
}

export interface DataEntryItem {
  columnId: string;
  value: any;
  status?: DataEntryStatus;
}

export interface DataEntry {
  id: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value: string | any;
  status: DataEntryStatus;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  approved_at?: string;
  approved_by?: string;
  rejected_by?: string;
  rejection_reason?: string;
  deleted_at?: string;
}

export interface DataEntryRecord {
  id: string;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  status: DataEntryStatus;
  createdAt: string;
  updatedAt?: string;
  submittedAt?: string;
  entries?: DataEntryItem[];
  columns?: Column[];
}

export interface EntryValidation {
  isValid: boolean;
  errors: ColumnValidationError[];
}

export interface ColumnValidationError {
  columnId: string;
  message: string;
  type: 'error' | 'warning';
}


import { Column } from './column';

export interface DataEntryForm {
  id?: string;
  schoolId: string;
  categoryId: string;
  entries: DataEntryItem[];
  status?: EntryStatus;
  createdAt?: string;
  updatedAt?: string;
  submittedAt?: string;
  isModified?: boolean;
}

export interface DataEntryItem {
  columnId: string;
  value: any;
  status?: EntryStatus;
}

export type EntryStatus = 'pending' | 'approved' | 'rejected' | 'draft';

export interface DataEntryRecord {
  id: string;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  status: EntryStatus;
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

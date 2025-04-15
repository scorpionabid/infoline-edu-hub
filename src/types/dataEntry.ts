
import { Column } from './column';

export interface DataEntryForm {
  id?: string;
  schoolId: string;
  categoryId: string;
  title?: string;
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
  entries: EntryValue[];
  submittedAt?: string;
  updatedAt?: string;
}

export interface EntryValue {
  id?: string;
  categoryId: string;
  columnId: string;
  value: string | number | boolean | null;
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  priority?: number;
  status?: string;
  assignment?: string;
  deadline?: string;
  columns: Column[];
}

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error'
}

export interface UseDataEntryProps {
  schoolId?: string;
  categories?: CategoryWithColumns[];
  onComplete?: () => void;
}

export interface CategoryEntryData {
  categoryId: string;
  entries: EntryValue[];
}

export interface ColumnValidationError {
  columnId: string;
  message: string;
}

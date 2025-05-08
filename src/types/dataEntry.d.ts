
export type DataEntryStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface DataEntry {
  id?: string;
  column_id: string;
  category_id: string;
  school_id: string;
  value: string;
  status?: DataEntryStatus;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
}

export interface EntryValue {
  id?: string;
  columnId: string;
  value: any;
  status?: string;
}

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SUCCESS = 'success',
  ERROR = 'error'
}

export interface DataEntryForm {
  entries: EntryValue[];
  isModified?: boolean;
  saveStatus?: DataEntrySaveStatus;
  error?: string | null;
  schoolId?: string;
  categoryId?: string;
  status?: DataEntryStatus;
}

export interface DataEntryTableData {
  id: string;
  categoryId: string;
  schoolId: string;
  columnId: string;
  columnName: string;
  value: any;
  status: string;
  columnType: string;
  createdAt: string;
  updatedAt: string;
}

// Define data structures for the form initializer and other components
export interface DataEntryField {
  columnId: string;
  value: any;
}

export interface DataEntryFormState {
  fields: DataEntryField[];
  isModified: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  error: string | null;
}


export type DataEntryStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface DataEntry {
  id?: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value: string;
  status?: DataEntryStatus;
  created_by?: string;
  approved_by?: string | null;
  approved_at?: string | null;
  rejected_by?: string | null;
  rejection_reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error'
}

export interface DataEntryForm {
  schoolId: string;
  categoryId: string;
  entries: EntryValue[];
}

export interface EntryValue {
  id?: string;
  column_id: string;
  name?: string;
  value: any;
  isValid?: boolean;
  error?: string;
  status?: DataEntryStatus;
  entryId?: string;
  columnId?: string;
}

export interface CategoryEntryData {
  categoryId: string;
  entries: EntryValue[];
}

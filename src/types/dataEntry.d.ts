
export type DataEntryStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error'
}

export interface DataEntry {
  id: string;
  column_id: string;
  category_id: string;
  school_id: string;
  value: string;
  status: DataEntryStatus;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
  approved_by?: string;
  approved_at?: Date;
  rejected_by?: string;
  rejected_at?: Date;
  rejection_reason?: string;
}

export interface EntryValue {
  column_id: string;
  columnId?: string; // alternativ ad
  value: string;
  name?: string;
  isValid?: boolean;
  error?: string;
  status?: DataEntryStatus;
  entryId?: string;
}

export interface DataEntryFormData {
  categoryId: string;
  schoolId: string;
  entries: EntryValue[];
}


export type DataEntryStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SUCCESS = 'success',
  ERROR = 'error'
}

export interface DataEntry {
  id?: string;
  column_id: string;
  category_id: string;
  school_id: string;
  value: any;
  status?: DataEntryStatus;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  approved_by?: string;
  rejected_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

export interface EntryValue {
  id?: string;
  columnId: string;
  value: any;
  status?: DataEntryStatus;
}

export interface DataEntryForm {
  id?: string;
  categoryId: string;
  schoolId: string;
  entries: EntryValue[];
  isModified?: boolean;
  saveStatus?: DataEntrySaveStatus;
  error?: string | null;
  status?: DataEntryStatus;
}

export interface CategoryEntryData {
  id: string;
  name: string;
  completionPercentage: number;
  status: string;
  lastUpdated?: string;
}

export interface SchoolEntryData {
  id: string;
  name: string;
  completionPercentage: number;
  status: string;
  lastUpdated?: string;
}

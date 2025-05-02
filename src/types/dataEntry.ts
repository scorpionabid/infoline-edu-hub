
import { Column } from './column';

// Data entry tipləri
export interface DataEntry {
  id: string;
  category_id: string;
  column_id: string;
  school_id: string;
  value: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  created_by?: string;
  approved_at?: string;
  approved_by?: string;
  rejected_by?: string;
  rejection_reason?: string;
}

// Data entry form dəyərləri üçün tip
export interface EntryValue {
  columnId: string;
  categoryId: string;
  value: string | number | boolean | string[] | null;
}

// Data entry schema
export interface DataEntrySchema {
  categoryId: string;
  columns: Column[];
  entries: DataEntry[];
}

// Category entry status
export type CategoryEntryStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'incomplete';

// Entry form data
export interface EntryFormData {
  categoryId: string;
  entries: EntryValue[];
}

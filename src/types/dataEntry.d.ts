
export type DataEntryStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface DataEntry {
  id?: string;
  column_id: string;
  columnId?: string;
  category_id: string;
  categoryId?: string;
  school_id: string;
  schoolId?: string;
  value: any;
  status?: DataEntryStatus;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
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
  isModified: boolean;
}

export interface CategoryEntryData {
  id: string;
  name: string;
  columns: any[];
  entries?: DataEntry[];
  status?: string;
  completionRate?: number;
  completionPercentage?: number;
}

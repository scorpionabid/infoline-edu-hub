
export interface EntryValue {
  columnId: string;
  value: string | number | boolean | null;
  errorMessage?: string;
  warningMessage?: string;
}

export interface DataEntryForm {
  id?: string;
  categoryId: string;
  schoolId: string;
  status?: DataEntryStatus;
  entries: EntryValue[];
  isModified?: boolean;
}

export type DataEntryStatus = 
  | 'draft' 
  | 'pending' 
  | 'approved' 
  | 'rejected'
  | 'incomplete';

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  SUBMITTING = 'submitting',
  SUBMITTED = 'submitted',
  ERROR = 'error'
}

export interface CategoryEntryData {
  id?: string;
  categoryId?: string;
  name: string;
  completionRate: number;
  status: string;
  values?: Array<{columnId: string; value: any; errorMessage?: string; warningMessage?: string}>;
}

export interface ColumnValidationError {
  columnId: string;
  columnName?: string;
  message: string;
  errorMessage?: string;
  severity?: 'error' | 'warning';
  categoryId?: string;
}

export interface DataEntryRecord {
  id: string;
  value: any;
  status: string;
  created_at: string;
  created_by: string;
  category_id: string;
  column_id: string;
  school_id: string;
  categories: {
    id: string;
    name: string;
  };
  columns: {
    id: string;
    name: string;
  };
  schools: {
    id: string;
    name: string;
    sector_id: string;
    sectors: {
      id: string;
      name: string;
      region_id: string;
    }[];
  }[];
}

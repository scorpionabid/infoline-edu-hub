
export interface DataEntry {
  id?: string;
  category_id: string;
  column_id: string;
  school_id: string;
  value: string;
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
}

export interface EntryValue {
  column_id: string;
  value: string;
}

export interface Errors {
  [key: string]: string;
}

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error'
}

export interface GetDataEntriesResponse {
  entries: DataEntry[];
  loading: boolean;
  error: string | null;
}

export interface DataEntryFormData {
  schoolId: string;
  categoryId: string;
  entries: DataEntry[];
  status?: 'draft' | 'pending' | 'approved' | 'rejected';
}

export interface DataEntryStats {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
  completion_percentage: number;
}

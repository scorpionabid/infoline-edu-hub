
export type DataEntryStatus = 'pending' | 'approved' | 'rejected' | 'draft';
export type DataEntrySaveStatus = 'saving' | 'saved' | 'error' | null;

export interface DataEntry {
  id: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value: string;
  status: DataEntryStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
  column?: any;
}

export interface DataEntryTableData {
  columnName: string;
  columnId: string;
  value: string;
  status: DataEntryStatus;
  columnType: string;
  error?: string;
}

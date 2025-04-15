
// Column validation error-ları
export interface ColumnValidationError {
  columnId: string;
  categoryId: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// EntryValue tipi - formların dəyərlərinin hansı tipi ola biləcəyini müəyyən edir
export type EntryValue = string | number | boolean | string[] | null;

// Data entry data interface
export interface DataEntryData {
  id: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  rejected_by?: string | null;
  rejection_reason?: string | null;
}

// Category Entry Data interface
export interface CategoryEntryData {
  categoryId: string;
  entries: {
    columnId: string;
    value: EntryValue;
  }[];
}


// Data giriş xətası
export interface ColumnValidationError {
  columnId: string;
  message: string;
  type: 'required' | 'minValue' | 'maxValue' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  columnName?: string; // Əlavə edildi
}

// Data Entry statusu
export type DataEntryStatus = 'pending' | 'approved' | 'rejected';

// Data enrty save statusu
export type DataEntrySaveStatus = 'saving' | 'saved' | 'error' | 'idle';

// Data Entry
export interface DataEntry {
  id: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value: string | null;
  status: DataEntryStatus;
  created_by?: string;
  approved_by?: string;
  rejected_by?: string;
  rejection_reason?: string;
  created_at: Date;
  updated_at: Date;
  approved_at?: Date;
  deleted_at?: Date;
}

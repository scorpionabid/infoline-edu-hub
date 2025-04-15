// Column validation error-ları
export interface ColumnValidationError {
  columnId: string;
  categoryId: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

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

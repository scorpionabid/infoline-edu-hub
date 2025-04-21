
export interface ColumnValidationError {
  field: string;
  message: string;
  type: string;
  severity: 'error' | 'warning' | 'info';
  columnId: string;
}

export interface DataEntry {
  id: string;
  column_id: string;
  school_id: string;
  category_id: string;
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

export interface DataEntryFormData {
  fields: Record<string, any>;
}

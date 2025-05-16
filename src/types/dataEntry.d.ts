
export interface DataEntry {
  id: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  created_at: string;
  created_by?: string;
  approved_at?: string;
  approved_by?: string;
  rejected_by?: string;
  rejection_reason?: string;
  updated_at: string;
}

export interface DataEntryRecord extends DataEntry {
  schoolName?: string;
  categoryName?: string;
  columnName?: string;
}

export interface DataEntryTableData {
  columns: import('./column').Column[];
  values: Record<string, string>;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface FormField {
  id: string;
  name: string;
  type: string;
  value: any;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ id: string; label: string; value: string }>;
  validation?: Record<string, any>;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: string;
}

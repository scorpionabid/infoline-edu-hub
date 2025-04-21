
export interface ColumnValidationError {
  field: string;
  message: string;
  type: string;
  severity: 'error' | 'warning' | 'info';
  columnId: string;
}

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error'
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

export interface CategoryEntryData {
  id: string;
  name: string;
  description?: string;
  columns: any[];
  entries: DataEntry[];
  status?: string;
  deadline?: string;
  completionPercentage?: number;
}

export interface EntryValue {
  columnId: string;
  value: any;
}

export interface UseDataEntryProps {
  schoolId?: string;
  categoryId?: string;
  onComplete?: () => void;
}

export interface UseDataEntryResult {
  categories: any[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
  formData: any;
  entries: DataEntry[];
  handleEntriesChange: (entries: DataEntry[]) => void;
  handleSave: () => Promise<void>;
  handleSubmitForApproval: () => Promise<void>;
  loadDataForSchool: (schoolId: string) => Promise<void>;
  submitForApproval: () => Promise<void>;
  saveStatus: DataEntrySaveStatus;
  isDataModified: boolean;
}

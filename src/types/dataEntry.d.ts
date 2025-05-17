
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
  valid: boolean;
  message?: string;
  errors?: Record<string, string>;
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

export interface FormFieldProps {
  column: import('./column').Column;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onValueChange?: (value: any) => void;
  isDisabled?: boolean;
}

export interface FormFieldsProps {
  columns: import('./column').Column[];
  disabled?: boolean;
}

export enum DataEntryStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DRAFT = 'draft'
}

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  ERROR = 'error',
  SUBMITTING = 'submitting',
  SUBMITTED = 'submitted'
}

export interface DataEntryForm {
  id: string;
  categoryId: string;
  schoolId: string;
  values: Record<string, string>;
  status: DataEntryStatus;
}

export interface DataEntrySaveBarProps {
  isDirty: boolean;
  isSubmitting: boolean;
  isSaving: boolean;
  onSave: () => Promise<any>;
  errors: boolean;
  isPendingApproval: boolean;
}

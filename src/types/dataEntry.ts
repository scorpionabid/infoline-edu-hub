
export type DataEntryStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'requires_revision';

export interface ApprovalItem {
  id: string;
  categoryId: string;
  categoryName: string;
  schoolId: string;
  schoolName: string;
  submittedAt: string;
  submittedBy: string;
  status: DataEntryStatus;
  entries: any[];
  completionRate: number;
}

export interface DataEntryFormData {
  [key: string]: any;
}

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface FieldValidation {
  [fieldId: string]: ValidationRule;
}

// Core data entry interface
export interface DataEntry {
  id: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value?: string;
  status?: DataEntryStatus | string;
  created_at: string;
  created_by?: string;
  approved_at?: string;
  approved_by?: string;
  rejected_by?: string;
  rejection_reason?: string;
  updated_at: string;
}

// Extended data entry with related entity names
export interface DataEntryRecord extends DataEntry {
  schoolName?: string;
  categoryName?: string;
  columnName?: string;
}

// Table data representation
export interface DataEntryTableData {
  columns: import('./column').Column[];
  values: Record<string, any>;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  message?: string;
  errors?: Record<string, string>;
}

// Form field interface
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

// Form field props
export interface FormFieldProps {
  column: import('./column').Column;
  value: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onValueChange?: (value: any) => void;
  isDisabled?: boolean;
}

// Form fields props
export interface FormFieldsProps {
  columns: import('./column').Column[];
  disabled?: boolean;
}

// Status enum with const assertion for runtime use
export const DataEntryStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DRAFT: 'draft',
  REQUIRES_REVISION: 'requires_revision'
} as const;

// Save status enum
export const DataEntrySaveStatus = {
  IDLE: 'idle',
  SAVING: 'saving',
  SAVED: 'saved',
  ERROR: 'error',
  SUBMITTING: 'submitting',
  SUBMITTED: 'submitted'
} as const;

export type DataEntrySaveStatusType = typeof DataEntrySaveStatus[keyof typeof DataEntrySaveStatus];

// Complete form data for a category
export interface DataEntryForm {
  id: string;
  categoryId: string;
  schoolId: string;
  values: Record<string, string>;
  status: DataEntryStatus;
}

// Props for save bar component
export interface DataEntrySaveBarProps {
  lastSaved?: string;
  isSaving: boolean;
  isSubmitting: boolean;
  isDirty?: boolean;
  completionPercentage?: number;
  onSave: () => void;
  onSubmit?: () => void;
  onDownloadTemplate?: () => void;
  onUploadData?: (file: File) => void;
  readOnly?: boolean;
  errors?: boolean;
  isPendingApproval?: boolean;
}

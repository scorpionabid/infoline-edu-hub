
// Data Entry types - enhanced with missing exports

export enum DataEntryStatus {
  DRAFT = 'draft',
  PENDING = 'pending', 
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface DataEntry {
  id: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value: string;
  status: DataEntryStatus | string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string; // Add missing property
  rejection_reason?: string;
  created_at: string;
  updated_at?: string;
}

export interface DataEntryFormData {
  [columnId: string]: any;
}

// Missing exports that were causing build errors
export interface ApprovalItem {
  id: string;
  type: 'dataEntry' | 'form';
  title: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  metadata?: Record<string, any>;
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max';
  value?: any;
  message: string;
}

export interface FieldValidation {
  isValid: boolean;
  errors: string[];
}

export interface DataEntryTableData {
  entries: DataEntry[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

export interface FormField {
  columnId: string;
  value: any;
  isValid: boolean;
  error?: string;
}

export interface FormFieldProps {
  id: string;
  name: string;
  value: any;
  onChange: (value: any) => void;
  readOnly?: boolean;
}

export interface FormFieldsProps {
  columns: any[];
  formData: Record<string, any>;
  onChange: (columnId: string, value: any) => void;
  readOnly?: boolean;
}

export type DataEntrySaveStatusType = 'saved' | 'saving' | 'error' | 'idle';

export interface DataEntryForm {
  id: string;
  category_id: string;
  formData: DataEntryFormData;
  status: DataEntryStatus;
  lastSaved?: string;
}

export interface DataEntrySaveBarProps {
  status: DataEntrySaveStatusType;
  onSave: () => void;
  onSubmit: () => void;
  hasUnsavedChanges: boolean;
}

export interface DataEntryValue {
  column_id: string;
  value: string;
  type: string;
}

export interface CategoryEntryData {
  category_id: string;
  entries: DataEntry[];
  completion_rate: number;
}

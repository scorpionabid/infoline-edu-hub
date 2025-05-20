
import { Column } from './column';

export enum DataEntryStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  SUBMITTING = 'submitting',
  SUBMITTED = 'submitted',
  ERROR = 'error'
}

export interface TabDefinition {
  id: string;
  title: string;
  label?: string;
  columns?: any[];
}

export interface DataEntry {
  id: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface DataEntryForm {
  categoryId: string;
  schoolId: string;
  entries: EntryValue[];
  isModified?: boolean;
}

export interface EntryValue {
  id?: string;
  columnId: string;
  value: any;
  status?: DataEntryStatus;
}

export interface DataEntryTableData {
  columns: Column[];
  values: Record<string, any>;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export interface FormFieldsProps {
  columns: Column[];
  disabled?: boolean;
  readOnly?: boolean;
}

export interface FormFieldProps {
  column: Column;
  value: any;
  onChange?: (e: React.ChangeEvent<any>) => void;
  onValueChange?: (value: any) => void;
  isDisabled?: boolean;
  field?: {
    id: any;
    name: any;
    type: any;
    value: any;
    required: any;
    placeholder: any;
    helpText: any;
    options: any;
    validation: any;
    onChange: (value: any) => void;
    error: string;
  };
}

export interface DataEntrySaveBarProps {
  isDirty: boolean;
  isSubmitting: boolean;
  isSaving: boolean;
  onSave: () => Promise<any>;
  errors: boolean;
  isPendingApproval: boolean;
  lastSaved?: string;
  completionPercentage?: number;
  onSubmit?: () => void;
  onDownloadTemplate?: () => void;
  onUploadData?: (file: File) => void;
  readOnly?: boolean;
}

export interface DataEntryRecord extends DataEntry {
  columns?: {
    name: string;
  };
  categories?: {
    name: string;
  };
  schools?: {
    name: string;
  };
  schoolName?: string;
  categoryName?: string;
  columnName?: string;
  createdAt?: string;
}

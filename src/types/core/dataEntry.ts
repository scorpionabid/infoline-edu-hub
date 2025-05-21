
import { BaseEntity } from './index';
import { Column } from './column';

/**
 * Core Data Entry type definitions
 */

// Status values for data entries
export enum DataEntryStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Status values for save operations
export enum DataEntrySaveStatus {
  IDLE = 'idle',
  SAVING = 'saving',
  SAVED = 'saved',
  SUBMITTING = 'submitting',
  SUBMITTED = 'submitted',
  ERROR = 'error'
}

// Core data entry interface
export interface DataEntry extends BaseEntity {
  school_id: string;
  category_id: string;
  column_id: string;
  value?: string;
  status?: DataEntryStatus | string;
  created_by?: string;
}

// Extended data entry with related entity names
export interface DataEntryRecord extends DataEntry {
  schoolName?: string;
  categoryName?: string;
  columnName?: string;
}

// Form value for a single entry
export interface EntryValue {
  id?: string;
  columnId: string;
  value: any;
  status?: DataEntryStatus;
}

// Complete form data for a category
export interface DataEntryForm {
  categoryId: string;
  schoolId: string;
  entries: EntryValue[];
  isModified?: boolean;
}

// Table data representation
export interface DataEntryTableData {
  columns: Column[];
  values: Record<string, any>;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  message?: string;
  errors?: Record<string, string>;
}

// Props for form fields component
export interface FormFieldsProps {
  columns: Column[];
  disabled?: boolean;
  readOnly?: boolean;
}

// Props for individual form field
export interface FormFieldProps {
  column: Column;
  value: any;
  onChange?: (e: React.ChangeEvent<any>) => void;
  onValueChange?: (value: any) => void;
  isDisabled?: boolean;
  readOnly?: boolean;
}

// Props for save bar component
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

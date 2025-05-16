
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

export interface DataEntryTableData {
  columns: Column[];
  values: Record<string, any>;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export interface FormFieldProps {
  column: Column;
  value: any;
  onChange?: (e: React.ChangeEvent<any>) => void;
  onValueChange?: (value: any) => void;
  isDisabled?: boolean;
}


import { ColumnType } from './column';
import { Json } from './supabase';

// Type for validation rules
export type ValidationRules = {
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  pattern?: string;
  patternMessage?: string;
  minDate?: string;
  maxDate?: string;
  warningThreshold?: {
    min?: number;
    max?: number;
  };
};

// Type for a single value in a data entry
export type EntryValue = string | number | boolean | null;

// Type for a dependency condition
export type DependsOnCondition = {
  columnId: string;
  condition: {
    type: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan';
    value: any;
  };
};

// Type for validation errors
export type ColumnValidationError = {
  columnId: string;
  message: string;
  categoryId: string;
};

// Type for a single data entry
export type DataEntry = {
  id: string;
  columnId: string;
  value: EntryValue;
  status: 'pending' | 'approved' | 'rejected';
  errorMessage?: string;
};

// Type for a category's data entries
export type CategoryEntryData = {
  categoryId: string;
  entries: DataEntry[];
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  values?: any[]; // Əlavə olaraq values xüsusiyyəti əlavə edirik
  completionPercentage?: number; // Tamamlanma faizi
  isCompleted?: boolean; // Tamamlanıb-tamamlanmadığı
  isSubmitted?: boolean; // Təqdim edilib-edilmədiyi
  approvalStatus?: string; // Təsdiq statusu
};

// Type for the entire form data
export type FormData = {
  schoolId: string;
  categories: CategoryEntryData[];
  lastSaved: string;
  overallProgress: number;
};

// Form data tipi əlavə edirik
export type DataEntryForm = {
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  entries: CategoryEntryData[];
  lastSaved: string;
  overallProgress: number;
  schoolId?: string;
};

// Submit data type
export type SubmitData = {
  categoryId: string;
  schoolId: string;
  values: { [columnId: string]: string };
};

// Types for state management
export type ActionType =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CATEGORIES'; payload: any[] }
  | { type: 'SET_CURRENT_CATEGORY'; payload: number }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'UPDATE_VALUE'; payload: { columnId: string; value: EntryValue } }
  | { type: 'SET_VALUE'; payload: { columnId: string; value: EntryValue; status: 'pending' | 'approved' | 'rejected' } }
  | { type: 'SET_ERROR_MESSAGE'; payload: { columnId: string; message: string } }
  | { type: 'CLEAR_ERROR_MESSAGE'; payload: { columnId: string } }
  | { type: 'SET_IS_SUBMITTING'; payload: boolean }
  | { type: 'SET_IS_AUTO_SAVING'; payload: boolean }
  | { type: 'SET_STATUS'; payload: 'draft' | 'submitted' | 'approved' | 'rejected' }
  | { type: 'SET_LAST_SAVED'; payload: string }
  | { type: 'SET_PROGRESS'; payload: number };

// For the DataEntryForm components
export type DataEntryFormProps = {
  categoryId: string;
  schoolId: string;
};

// Re-exporting types for other modules
export type { Category } from './category';
export type { Column } from './column';

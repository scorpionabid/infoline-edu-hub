
import { CategoryWithColumns, Column } from "./column";

export interface EntryValue {
  id?: string;
  columnId?: string; // Added for compatibility
  value: any;
  status?: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  errorMessage?: string; // Added for compatibility
}

export interface DataEntryField {
  column: Column;
  value: EntryValue;
}

export interface DataEntryCategory {
  category: CategoryWithColumns;
  fields: DataEntryField[];
  completionPercentage: number;
}

export interface DataEntryForm {
  categories: DataEntryCategory[];
  overallCompletionPercentage: number;
  lastSaved?: string;
  formId?: string; // Added for compatibility
  status?: 'draft' | 'submitted' | 'approved' | 'rejected'; // Added for compatibility
  entries?: CategoryEntryData[]; // Added for compatibility
}

// Category data with values for entry form
export interface CategoryEntryData {
  categoryId: string;
  values: {
    columnId: string;
    value: any;
    status?: string;
    errorMessage?: string;
  }[];
  isCompleted?: boolean;
  isSubmitted?: boolean;
  completionPercentage: number;
  approvalStatus?: string;
}

// Validation error interface
export interface ColumnValidationError {
  columnId: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

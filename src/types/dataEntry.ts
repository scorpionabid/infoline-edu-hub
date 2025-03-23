
import { ColumnType } from "./column";

export interface EntryValue {
  columnId: string;
  value: string | number | Date | boolean | string[];
  status: 'pending' | 'approved' | 'rejected';
  errorMessage?: string;
}

export interface CategoryEntryData {
  categoryId: string;
  values: EntryValue[];
  isCompleted: boolean;
  isSubmitted: boolean;
  completionPercentage: number;
}

export interface DataEntryForm {
  formId: string;
  schoolId: string;
  entries: CategoryEntryData[];
  lastSaved?: string;
  overallProgress: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export interface ColumnValidationError {
  columnId: string;
  message: string;
}


export type DataEntryStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface ValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternError?: string;
  email?: boolean;
  url?: boolean;
  minDate?: string;
  maxDate?: string;
  [key: string]: any;
}

export interface ColumnEntry {
  columnId: string;
  value: string | number | boolean | Date | string[];
  status: DataEntryStatus;
  errorMessage?: string;
}

export interface CategoryEntryData {
  categoryId: string;
  entries: ColumnEntry[];
  status: DataEntryStatus;
  isCompleted: boolean;
  isSubmitted: boolean;
  completionPercentage: number;
}

export interface DataEntryForm {
  status: DataEntryStatus;
  entries: CategoryEntryData[];
  lastSaved: string;
  overallProgress: number;
  schoolId?: string;
}

export interface CategoryFilter {
  status?: string;
  assignment?: 'all' | 'sectors';
  search: string;
  showArchived: boolean;
}

export interface ColumnReport {
  columnId: string;
  columnName: string;
  categoryId: string;
  categoryName: string;
  value: string | number | boolean;
  status: DataEntryStatus;
}

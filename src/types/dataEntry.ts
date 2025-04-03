
export type DataEntryStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'pending';

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
  values?: any[]; // Köhnə kodla uyğunluq üçün lazımdır
  submittedAt?: string; // Köhnə kodla uyğunluq üçün lazımdır
}

export interface DataEntryForm {
  status: DataEntryStatus;
  entries: CategoryEntryData[];
  lastSaved: string;
  overallProgress: number;
  schoolId?: string;
  formId?: string; // useFormState üçün əlavə edildi
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

export interface DataEntry {
  id: string;
  category_id: string;
  column_id: string;
  school_id: string;
  value?: string;
  status?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
}

// ActionType tipini əlavə edirik
export enum ActionType {
  SET_FORM_DATA = 'SET_FORM_DATA',
  UPDATE_FORM_STATUS = 'UPDATE_FORM_STATUS',
  UPDATE_ENTRY = 'UPDATE_ENTRY',
  ADD_ERROR = 'ADD_ERROR',
  REMOVE_ERROR = 'REMOVE_ERROR',
  CLEAR_ERRORS = 'CLEAR_ERRORS',
  START_AUTO_SAVE = 'START_AUTO_SAVE',
  STOP_AUTO_SAVE = 'STOP_AUTO_SAVE',
  SET_FORM_SAVED = 'SET_FORM_SAVED'
}

// ColumnValidationError interfeysi əlavə edirik
export interface ColumnValidationError {
  columnId: string;
  message: string;
}

// EntryValue tipi əlavə edirik
export type EntryValue = string | number | boolean | Date | string[] | null;


export interface ColumnValidationError {
  columnId: string;
  message: string;
  categoryId?: string;
  severity?: 'error' | 'warning';
}

export interface ColumnValidationResult {
  isValid: boolean;
  errors: ColumnValidationError[];
}

export interface DataEntryStatus {
  DRAFT: 'draft';
  PENDING: 'pending';
  APPROVED: 'approved';
  REJECTED: 'rejected';
}

export interface DataEntrySaveStatus {
  IDLE: 'idle';
  SAVING: 'saving';
  SAVED: 'saved';
  SUBMITTING: 'submitting';
  SUBMITTED: 'submitted';
  ERROR: 'error';
}

export interface CategoryEntryData {
  id: string;
  categoryId: string;
  schoolId?: string;
  values: Array<{columnId: string; value: any; errorMessage?: string; warningMessage?: string}>;
  status?: string;
  isModified?: boolean;
  errors?: Record<string, string>;
}

export interface DataEntryForm {
  entries: Record<string, string>;
  status: string;
  schoolId?: string;
  categoryId?: string;
  isModified?: boolean;
}

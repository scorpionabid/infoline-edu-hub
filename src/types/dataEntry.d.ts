
export interface ColumnValidationError {
  columnId: string;
  message: string;
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

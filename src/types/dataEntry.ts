
export interface DataEntry {
  id: string;
  category_id: string;
  column_id: string;
  school_id: string;
  categoryId?: string;
  columnId?: string;
  schoolId?: string;
  value: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  errorMessage?: string;
}

export type DataEntryStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'overdue';

export interface CategoryFilter {
  assignment: 'all' | 'sectors' | '';
  status: string;
  archived: boolean;
  showArchived?: boolean;
  search?: string; 
}

export interface ColumnValidationError {
  columnId: string;
  message: string;
}

export interface CategoryEntryData {
  categoryId: string;
  entries: Record<string, string>;
  status: DataEntryStatus;
}

export interface ColumnEntry {
  columnId: string;
  value: string;
  isValid: boolean;
  errorMessage?: string;
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customValidation?: (value: any) => boolean | string;
}

export interface DataEntryForm {
  categoryId: string;
  schoolId: string;
  entries: Record<string, ColumnEntry>;
  status: DataEntryStatus;
  lastSaved: string;
  hasUnsavedChanges: boolean;
  validationErrors: Record<string, string>;
}

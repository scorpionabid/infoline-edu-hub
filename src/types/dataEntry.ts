
export type DataEntrySaveStatus = 'saved' | 'saving' | 'error';

export type DataEntryStatus = 'pending' | 'approved' | 'rejected';

export interface DataEntryTableData {
  id: string;
  categoryId: string;
  columnId: string;
  schoolId: string;
  value: string;
  status: DataEntryStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  approvedBy?: string;
  rejectedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface DataEntryFormData {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

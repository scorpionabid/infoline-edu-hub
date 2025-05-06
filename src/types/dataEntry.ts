
export type DataEntrySaveStatus = 'saved' | 'saving' | 'error' | 'idle' | 'submitting' | 'submitted';

export type DataEntryStatus = 'pending' | 'approved' | 'rejected' | 'draft';

export interface EntryValue {
  id?: string;
  columnId: string;
  value: any;
  status?: DataEntryStatus;
}

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

export interface DataEntryForm {
  id?: string;
  categoryId: string;
  schoolId: string;
  entries: EntryValue[];
}

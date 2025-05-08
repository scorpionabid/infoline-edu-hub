
export interface DataEntryForm {
  id?: string;
  categoryId: string;
  schoolId: string;
  entries: EntryValue[];
  status?: string;
  isModified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EntryValue {
  columnId: string;
  value: any;
}

export interface DataEntryRecord {
  id: string;
  categoryId: string;
  schoolId: string;
  columnId: string;
  value: any;
  status: string;
  createdAt: string;
  updatedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

export interface ColumnValidationError {
  columnId: string;
  columnName: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

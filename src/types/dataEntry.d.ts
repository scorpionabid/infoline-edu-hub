
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
  categories?: {
    id?: string;
    name?: string;
  };
  columns?: {
    id?: string;
    name?: string;
  };
  schools?: any[];
  created_at?: string;
  created_by?: string;
  category_id?: string;
  column_id?: string;
  school_id?: string;
}

export interface ColumnValidationError {
  columnId: string;
  columnName: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

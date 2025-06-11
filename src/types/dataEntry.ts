
export type DataEntryStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'requires_revision';

export interface ApprovalItem {
  id: string;
  categoryId: string;
  categoryName: string;
  schoolId: string;
  schoolName: string;
  submittedAt: string;
  submittedBy: string;
  status: DataEntryStatus;
  entries: any[];
  completionRate: number;
}

export interface DataEntryFormData {
  [key: string]: any;
}

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface FieldValidation {
  [fieldId: string]: ValidationRule;
}

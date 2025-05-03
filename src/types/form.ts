
export type FormStatus = 'completed' | 'pending' | 'approved' | 'rejected' | 'dueSoon' | 'overdue' | 'draft' | 'incomplete' | 'all';

export interface FormStatusCount {
  completed: number;
  pending: number;
  rejected: number;
  dueSoon: number;
  overdue: number;
  approved: number;
  draft: number;
  incomplete: number;
  total: number;
}

export interface FormItem {
  id: string;
  name: string;
  status: FormStatus;
  deadline?: string;
  submittedAt?: string;
  date?: string;
  completionPercentage?: number;
}

export interface DataEntryStatus {
  status: 'pending' | 'approved' | 'rejected' | 'draft' | 'incomplete';
  message?: string;
  updatedAt?: string;
  approvedBy?: string;
  rejectedBy?: string;
  rejectionReason?: string;
}

export interface ColumnValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  errorMessage?: string;
}

export interface ColumnOption {
  label: string;
  value: string;
}


export type FormStatus = 'completed' | 'pending' | 'approved' | 'rejected' | 'dueSoon' | 'overdue' | 'draft' | 'incomplete';

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
}

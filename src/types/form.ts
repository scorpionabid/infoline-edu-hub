
export type FormStatus = 'completed' | 'pending' | 'rejected' | 'dueSoon' | 'overdue' | 'approved' | 'draft';

export interface FormStatusCount {
  completed: number;
  pending: number;
  rejected: number;
  dueSoon: number;
  overdue: number;
  approved: number;
  draft: number;
  total: number;
}

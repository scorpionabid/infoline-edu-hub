
export type FormStatus = 'pending' | 'approved' | 'rejected' | 'overdue' | 'dueSoon';

export interface FormItem {
  id: string;
  title: string;
  status: FormStatus;
  completionPercentage: number;
  category?: string;
  date?: string;
}

export interface FormStats {
  pending: number;
  approved: number;
  rejected: number;
  dueSoon: number;
  overdue: number;
}

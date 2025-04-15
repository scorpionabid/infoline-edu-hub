
export type FormStatus = 'pending' | 'approved' | 'rejected' | 'dueSoon' | 'overdue' | 'draft' | 'empty';

export interface Form {
  id: string;
  title: string;
  status: FormStatus;
  completionPercentage: number;
  dueDate: string;
  description?: string;
  category?: string;
  deadline?: string;
}

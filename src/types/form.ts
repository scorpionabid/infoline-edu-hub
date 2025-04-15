
export type FormStatus = 'pending' | 'approved' | 'rejected' | 'dueSoon' | 'overdue';

export interface Form {
  id: string;
  title: string;
  status: FormStatus;
  completionPercentage: number;
  dueDate: string;
  description?: string;
}

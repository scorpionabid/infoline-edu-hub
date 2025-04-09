
export type FormStatus = 'pending' | 'approved' | 'rejected' | 'draft' | 'overdue' | 'due' | 'empty';

export interface Form {
  id: string;
  title: string;
  category: string;
  status: FormStatus;
  completionPercentage: number;
  deadline?: string;
  date?: string;
}

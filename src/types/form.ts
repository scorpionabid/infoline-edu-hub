
export interface Form {
  id: string;
  title: string;
  categoryId: string;
  status: FormStatus;
  dueDate?: string;
  deadline: string; 
  completionPercentage: number; 
  filledCount: number;
  totalCount: number;
  createdAt?: string;
  updatedAt?: string;
  data?: any;
  userId?: string;
  schoolId?: string;
}

export type FormStatus = 'pending' | 'approved' | 'rejected' | 'overdue' | 'dueSoon' | 'draft' | 'inProgress';

export interface FormItem {
  id: string;
  title: string;
  categoryId: string;
  status: FormStatus;
  completionPercentage: number;
  deadline: string;
  filledCount: number;
  totalCount: number;
}

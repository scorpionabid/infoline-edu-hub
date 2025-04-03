
export type FormStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'overdue' | 'dueSoon' | 'submitted';

export interface FormItem {
  id: string;
  title: string;
  categoryId: string;
  status: FormStatus;
  completionPercentage: number;
  deadline: string;
  filledCount: number;
  totalCount: number;
  dueDate?: string;
  categoryName?: string;
  createdAt?: string;
  updatedAt?: string;
  data?: any;
  userId?: string;
  schoolId?: string;
}

export interface Form {
  id: string;
  title: string;
  categoryId: string;
  categoryName?: string;
  status: FormStatus;
  completionPercentage: number;
  deadline?: string;
  dueDate?: string;
  filledCount: number;
  totalCount: number;
  createdAt?: string;
  updatedAt?: string;
  data?: any;
  userId: string;
  schoolId: string;
}

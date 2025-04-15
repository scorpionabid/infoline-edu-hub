
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

export interface CategoryEntryData {
  categoryId: string;
  values: {
    columnId: string;
    value: any;
    status?: string;
    errorMessage?: string;
  }[];
  isCompleted?: boolean;
  isSubmitted?: boolean;
  completionPercentage: number;
  approvalStatus?: string;
}

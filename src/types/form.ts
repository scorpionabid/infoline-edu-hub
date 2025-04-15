
// Form status enumeration
export enum FormStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DRAFT = 'draft',
  EXPIRED = 'expired',
  DUE_SOON = 'dueSoon',
  OVERDUE = 'overdue',
  COMPLETED = 'completed'
}

// Form interface
export interface Form {
  id: string;
  title: string;
  status: FormStatus;
  completionPercentage: number;
  dueDate: string;
  description?: string;
  category?: string;
  deadline?: string;
  date?: string;
}

// FormItem interface (for use in lists)
export interface FormItem {
  id: string;
  title: string;
  status: string;
  completionPercentage: number;
  dueDate: string;
  description?: string;
  date?: string;
}

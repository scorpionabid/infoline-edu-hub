
// Form status enumeration - JS dəyişəni kimi istifadə üçün
export const FormStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DRAFT: 'draft',
  EXPIRED: 'expired',
  DUE_SOON: 'dueSoon', 
  OVERDUE: 'overdue',
  COMPLETED: 'completed'
} as const;

// FormStatus tipi
export type FormStatus = typeof FormStatus[keyof typeof FormStatus];

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

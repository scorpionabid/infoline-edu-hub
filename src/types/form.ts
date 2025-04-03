
export type FormStatus = 'pending' | 'approved' | 'rejected' | 'overdue' | 'dueSoon' | 'due';

export interface Form {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  status: FormStatus;
  completionPercentage: number;
  categoryId?: string;
  category?: string; // Geriyə uyğunluq üçün
}

export interface FormItem {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'overdue' | 'dueSoon' | 'due';
  completionPercentage: number;
  deadline?: string;
  category?: string; // Geriyə uyğunluq üçün
}

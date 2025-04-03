
// FormStatus tipini gücləndiririk
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
  status: FormStatus; // String tipinin təyin edilməsi problemini həll edək
  completionPercentage: number;
  deadline?: string;
  category?: string; // Geriyə uyğunluq üçün
}

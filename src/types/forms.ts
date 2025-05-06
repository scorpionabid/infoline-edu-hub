
export interface FormItem {
  id: string;
  name: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  categoryName: string;
  dueDate: string;
  createdAt: string;
  completionRate: number;
}

export interface RecentForm extends FormItem {
  categoryId?: string;
}

export interface FormDeadline extends FormItem {
  daysLeft?: number;
}

export interface FormCategory {
  id: string;
  name: string;
  description?: string;
  status: string;
  deadline?: string | null;
  completionRate?: number;
}

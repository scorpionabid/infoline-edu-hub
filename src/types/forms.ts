
export interface FormItem {
  id: string;
  title: string;
  categoryName: string;
  dueDate?: string | Date | null;
  createdAt: string | Date;
  completionRate: number;
  status?: string;
}

export interface RecentForm extends FormItem {
  // RecentForm extends base FormItem
}

export interface FormDeadline extends FormItem {
  // FormDeadline extends base FormItem
}

export interface FormCategory {
  id: string;
  name: string;
  description?: string;
  status: string;
  deadline?: string | Date | null;
  completionRate?: number;
}

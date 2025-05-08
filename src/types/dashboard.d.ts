
export interface DashboardStats {
  totalSchools: number;
  activeSchools: number;
  pendingSchools: number;
  completionRate: number;
}

export interface FormStats {
  completed: number;
  pending: number;
  totalForms: number;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string | Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface CategoryStat {
  id: string;
  name: string;
  completionRate: number;
  status: string;
  dueDate?: string | Date;
}

export interface SchoolCompletionData {
  schoolId: string;
  schoolName: string;
  completionRate: number;
}

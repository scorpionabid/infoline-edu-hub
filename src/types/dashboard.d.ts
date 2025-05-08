
export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

export type FormStats = {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  total: number;
};

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

export interface CategoryStat {
  id: string;
  name: string;
  completionRate: number;
  status: string;
}

export interface PendingApproval {
  id: string;
  title?: string;
  schoolId?: string;
  schoolName: string;
  school?: string;
  categoryId?: string;
  categoryName: string;
  date?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SuperAdminDashboardData {
  formStats: FormStats;
  regionCompletion: {
    region: string;
    completionRate: number;
  }[];
  recentForms: PendingApproval[];
  formsByStatus?: FormStats;
}

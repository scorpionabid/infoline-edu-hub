
import { Report, ReportType } from './report';
import { Category } from './category';

export interface FormStats {
  completed: number;
  pending: number;
  rejected: number;
  total: number;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[] | string;
    borderColor?: string[] | string;
    borderWidth?: number;
  }[];
}

export interface CategoryStat {
  id: string;
  name: string;
  completionRate: number;
  overallRate?: number;
  status: string;
  deadline?: string;
}

export interface PendingApproval {
  id: string;
  title: string;
  status: 'pending';
  date: string;
  school: string;
  schoolName: string;
  categoryName: string;
  submittedAt: string;
}

// Re-export Report and ReportType to avoid duplicate references
export { Report, ReportType };

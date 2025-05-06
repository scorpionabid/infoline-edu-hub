
import { Region } from './region';
import { Sector } from './sector';
import { School } from './school';
import { Category } from './category';

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  date: string;
  isRead: boolean;
}

export interface FormStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
}

export interface FormStatus {
  id: string;
  name: string;
  status: 'pending' | 'completed' | 'overdue';
  dueDate: string;
}

export interface CategoryStat {
  id: string;
  name: string;
  status: string;
  progress: number;
  completedSchools: number;
  totalSchools: number;
}

export interface PendingApproval {
  id: string;
  schoolName: string;
  categoryName: string;
  submittedBy: string;
  submittedAt: string;
  school?: School;
  category?: Category;
}

export interface RecentActivity {
  id: string;
  action: string;
  target: string;
  date: string;
  user: string;
}

export interface DashboardData {
  stats: {
    regions?: number;
    sectors?: number;
    schools: number;
    activeSchools: number;
    forms?: FormStats;
    categories?: number;
    pendingApprovals?: number;
    completionRate?: number;
  };
  pendingApprovals?: PendingApproval[];
  recentActivities: RecentActivity[];
  notifications: DashboardNotification[];
}

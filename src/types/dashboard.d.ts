
import { DataEntryStatus } from './dataEntry';

export interface DashboardData {
  stats: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
  };
  completionRate: number;
  regions: any[];
  pendingApprovals: PendingApprovalItem[];
  recentActivities: ActivityLogItem[];
  notifications: DashboardNotification[];
  userCount: number;
}

export interface PendingApprovalItem {
  id: string;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  submittedAt: string;
  status: string;
}

export interface PendingItem {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  school: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
}

export interface SuperAdminDashboardData extends DashboardData {
  formsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
  };
  categoryStats: CategoryStat[];
  approvalRate: number;
}

export interface CategoryStat {
  id: string;
  name: string;
  totalEntries: number;
  pendingEntries: number;
  approvedEntries: number;
  completionPercentage: number;
}

export interface RegionAdminDashboardData extends DashboardData {
  sectorStats: SectorCompletionItem[];
  schoolStats: SchoolStat[];
  categoryStats: CategoryStat[];
}

export interface SectorCompletionItem {
  id: string;
  name: string;
  completion: number;
  schoolCount: number;
}

export interface SchoolStat {
  id: string;
  name: string;
  completion?: number;
}

export interface SectorAdminDashboardData {
  schoolsStats: SchoolStat[];
  stats: {
    schools: number;
  };
  completionRate: number;
  notifications: DashboardNotification[];
  activityLog: ActivityLogItem[];
}

export interface ActivityLogItem {
  id: string;
  action: string;
  user: string;
  date: string;
  entityType: string;
  entityId: string;
}

export interface SchoolAdminDashboardData {
  completionRate: number;
  formStats: {
    approved: number;
    pending: number;
    rejected: number;
    incomplete: number;
  };
  notifications: DashboardNotification[];
  completion: {
    percentage: number;
    total: number;
    completed: number
  };
}

export interface FormItem {
  id: string;
  name: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  deadline?: string;
  submittedAt?: string;
}

// Component Props Types
export interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}

export interface CompletionRateCardProps {
  completionRate: number;
  title: string;
}

export interface NotificationsCardProps {
  title: string;
  notifications: {
    id: string;
    title: string;
    message: string;
    date: string;
    type: 'info' | 'warning' | 'success' | 'error';
    isRead: boolean;
  }[];
}

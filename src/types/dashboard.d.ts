
export type DashboardTrendDirection = 'up' | 'down' | 'neutral';

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  read: boolean; // Legacy compatibility
}

export interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  description?: string;
  trend?: string;
  trendDirection?: DashboardTrendDirection;
  onClick?: () => void;
}

export interface CompletionRateCardProps {
  title: string;
  completionRate: number;
  description?: string;
}

export interface NotificationsCardProps {
  title: string;
  notifications: DashboardNotification[];
  viewAll?: () => void;
}

export interface SchoolStatItem {
  total: number;
  active: number;
  incomplete: number;
}

export interface PendingApprovalItem {
  id: string;
  name: string;
  school: string;
  date: string;
  status: string;
}

export interface SuperAdminDashboardData {
  stats: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
  };
  completionRate: number;
  notifications: DashboardNotification[];
  regions: any[];
  pendingApprovals: PendingApprovalItem[];
  approvalRate: number;
  regionCount: number;
  sectorCount: number;
  schoolCount: number;
  userCount: number;
}

export interface RegionAdminDashboardData {
  stats: {
    sectors: number;
    schools: number;
    users: number;
  };
  completionRate: number;
  notifications: DashboardNotification[];
  pendingItems: PendingApprovalItem[];
  categories: any[];
  sectors: any[];
  sectorStats: {
    total: number;
    active: number;
  };
  schoolStats: {
    total: number;
    active: number;
    incomplete: number;
  };
}

export interface SectorAdminDashboardData {
  stats: {
    schools: number;
    users: number;
  };
  completionRate: number;
  notifications: DashboardNotification[];
  pendingItems: PendingApprovalItem[];
  schools: any[];
  categories: any[];
  schoolsStats: SchoolStatItem[];
}

export interface SchoolAdminDashboardData {
  formStats: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    incomplete: number;
    drafts: number;
  };
  completionRate: number;
  notifications: DashboardNotification[];
  categories: any[];
}

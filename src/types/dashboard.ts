
export interface SchoolStat {
  total: number;
  active: number;
  incomplete: number;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  read: boolean;
}

export interface PendingApprovalItem {
  id: string;
  name: string;
  school: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface DashboardData {
  regions?: number;
  sectors?: number;
  schools?: number;
  users?: number;
  completionRate?: number;
  pendingForms?: number;
  approvedForms?: number;
  rejectedForms?: number;
  totalForms?: number;
  draftForms?: number;
  incompleteForms?: number;
  activeSectors?: number;
  activeSchools?: number;
  incompleteSchools?: number;
  approvalRate?: number;
  categories?: any[];
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
  formsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
}

export interface RegionAdminDashboardData {
  stats: {
    sectors: number;
    schools: number;
    users: number;
  };
  completionRate: number;
  notifications: DashboardNotification[];
  pendingItems: any[];
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
  pendingItems: any[];
  schools: any[];
  categories: any[];
  schoolsStats: SchoolStat[];
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

export interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  description?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}

export interface CompletionRateCardProps {
  completionRate: number;
  title: string;
}

export interface NotificationsCardProps {
  notifications: DashboardNotification[];
  title: string;
  maxNotifications?: number;
}

export type FormItem = {
  id: string;
  name: string;
  category: string;
  status: 'approved' | 'pending' | 'rejected' | 'incomplete' | 'draft';
  completionPercentage: number;
  deadline?: string;
};

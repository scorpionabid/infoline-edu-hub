
export interface StatsCardProps {
  title: string;
  value: number;
  icon: string | React.ReactNode;
  description: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}

export interface CompletionRateCardProps {
  title: string;
  completionRate: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
}

export interface NotificationsCardProps {
  title: string;
  notifications: Notification[];
}

export interface SchoolAdminDashboardData {
  formStats: {
    approved: number;
    pending: number;
    rejected: number;
    incomplete: number;
    total?: number;
    drafts?: number;
  };
  completionRate: number;
  notifications: Notification[];
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
  notifications: Notification[];
  formsByStatus?: any;
  pendingApprovals?: any;
  regions?: any[];
  regionCount?: number;
  sectorCount?: number;
  schoolCount?: number;
  userCount?: number;
}

export interface RegionAdminDashboardData {
  stats: {
    sectors: number;
    schools: number;
    users: number;
  };
  completionRate: number;
  notifications: Notification[];
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
  notifications: Notification[];
  schoolStats: {
    total: number;
    active: number;
    incomplete: number;
  };
}

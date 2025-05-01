
export interface StatsCardProps {
  title: string;
  value: number | string;
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
    message?: string;
    date: string;
    type?: string;
    isRead?: boolean;
  }[];
}

export interface FormStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  incomplete: number;
  drafts: number;
}

export interface DashboardData {
  stats: {
    [key: string]: number;
  };
  completionRate: number;
  notifications: {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    type: 'info' | 'warning' | 'success' | 'error';
    read: boolean;
  }[];
  charts?: any;
}

export interface SchoolAdminDashboardData {
  formStats: FormStats;
  completionRate: number;
  notifications: {
    id: string;
    title: string;
    message: string;
    timestamp: string;
    type: 'info' | 'warning' | 'success' | 'error';
    read: boolean;
  }[];
}

export interface SectorAdminDashboardData extends DashboardData {
  schoolStats: {
    total: number;
    active: number;
    incomplete: number;
  };
}

export interface RegionAdminDashboardData extends DashboardData {
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

export interface SuperAdminDashboardData extends DashboardData {
  regionStats: {
    total: number;
    active: number;
  };
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

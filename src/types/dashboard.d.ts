
export interface Dashboard {
  // Common dashboard properties
  totalSchools?: number;
  totalSectors?: number;
  pendingApprovals?: number;
  recentSubmissions?: any[];
  notifications?: DashboardNotification[];
  formStats?: DashboardFormStats;
  completionRate?: number;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
}

export interface DashboardFormStats {
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  total: number;
  dueSoon: number;
  overdue: number;
}

export interface FormStats {
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  total: number;
}

export interface SchoolAdminDashboard extends Dashboard {
  categories?: CategoryStat[];
  completionStats?: {[key: string]: number};
  upcomingDeadlines?: DeadlineInfo[];
}

export interface SectorAdminDashboard extends Dashboard {
  schools?: SchoolStat[];
  categories?: CategoryStat[];
  sectorCompletionRate?: number;
}

export interface RegionAdminDashboard extends Dashboard {
  sectors?: SectorStat[];
  regionCompletionRate?: number;
}

export interface SuperAdminDashboardData extends Dashboard {
  regions?: RegionStat[];
  regionCompletion?: {[key: string]: number};
}

export interface CategoryStat {
  id: string;
  name: string;
  completionRate: number;
  status: string;
  deadline?: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  pendingCount: number;
}

export interface SectorStat {
  id: string;
  name: string;
  schoolCount: number;
  completionRate: number;
}

export interface RegionStat {
  id: string;
  name: string;
  sectorCount: number;
  schoolCount: number;
  completionRate: number;
}

export interface DeadlineInfo {
  id: string;
  name: string;
  deadline: string;
  daysLeft: number;
  status: string;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

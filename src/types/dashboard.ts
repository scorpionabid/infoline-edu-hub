
// Bu fayl əvvəldən mövcud olmaya bilər, tam olaraq yaradaq

export interface DashboardSummary {
  totalForms?: number;
  completedForms?: number;
  pendingForms?: number;
  overdueForms?: number;
  completionRate?: number;
}

export interface FormsByStatus {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface FormStats {
  pending?: number;
  approved?: number;
  rejected?: number;
  total?: number;
  incomplete?: number;
  drafts?: number;
  dueSoon?: number;
  overdue?: number;
}

export interface ActivityItem {
  id: string;
  type?: string;
  title: string;
  description?: string;
  timestamp: string;
  user?: string;
}

export interface RecentForm {
  id: string;
  title?: string;
  status?: string;
  progress?: number;
  dueDate?: string;
}

export interface RegionStats {
  id: string;
  name: string;
  totalSchools?: number;
  completionRate?: number;
  schoolCount?: number;
  sectorCount?: number;
}

export interface SectorStats {
  id: string;
  name: string;
  regionId?: string;
  regionName?: string;
  totalSchools?: number;
  completionRate?: number;
  total?: number;
  active?: number;
}

export interface SchoolStats {
  id: string;
  name: string;
  sectorId?: string;
  sectorName?: string;
  regionId?: string;
  regionName?: string;
  completedForms?: number;
  totalForms?: number;
  completionRate?: number;
  total?: number;
}

export interface UINotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  read?: boolean;
  date?: string;
  createdAt?: string;
}

export type Notification = UINotification;

export interface DashboardData {}

export interface SuperAdminDashboardData extends DashboardData {
  regions?: RegionStats[];
  stats: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
  };
  totalSchools?: number;
  totalUsers?: number;
  summary?: DashboardSummary;
  recentActivity?: ActivityItem[];
  notifications?: Notification[];
  formsByStatus?: FormsByStatus;
  approvalRate?: number;
  completionRate?: number;
}

export interface RegionAdminDashboardData extends DashboardData {
  sectors?: SectorStats[];
  stats: {
    sectors: number;
    schools: number;
    users: number;
    completion_rate?: number;
    total_entries?: number;
    pending_count?: number;
    pending_schools?: number;
  };
  totalSchools?: number;
  summary?: DashboardSummary;
  recentActivity?: ActivityItem[];
  notifications?: Notification[];
  sectorStats?: {
    total: number;
    active: number;
  };
  schoolStats?: {
    total: number;
    active: number;
    incomplete: number;
  };
  approvalRate?: number;
  completionRate?: number;
}

export interface SectorAdminDashboardData extends DashboardData {
  schools?: SchoolStats[];
  stats: {
    schools: number;
    users: number;
  };
  summary?: DashboardSummary;
  recentActivity?: ActivityItem[];
  notifications?: Notification[];
  schoolsStats?: SchoolStats[];
  schoolStats?: SchoolStats[];
  approvalRate?: number;
  completionRate?: number;
}

export interface SchoolAdminDashboardData extends DashboardData {
  upcomingDeadlines?: RecentForm[];
  recentForms?: RecentForm[];
  summary?: DashboardSummary;
  recentActivity?: ActivityItem[];
  notifications?: Notification[];
  formStats?: FormStats;
  approvalRate?: number;
  completionRate?: number;
}

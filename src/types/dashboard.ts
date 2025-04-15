export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: 'system' | 'deadline' | 'category' | 'approval' | 'rejection';
  userId: string;
  isRead: boolean;
  priority: 'high' | 'normal' | 'low';
  date: string;
  time: string;
  createdAt?: string; // createdAt əlavə edildi
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export type NotificationPriority = 'high' | 'normal' | 'low';

export interface FormItem {
  id: string;
  title: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'overdue' | 'dueSoon';
  completionPercentage: number;
  category: string;
  description?: string;
}

export interface PendingItem {
  id: string;
  school: string;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ActivityLogItem {
  id: string;
  action: string;
  target: string;
  time: string;
}

export interface StatsItem {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
}

export interface RegionStat {
  id: string;
  name: string;
  sectorCount: number;
  schoolCount: number;
  completionRate: number;
}

export interface SectorCompletion {
  id: string;
  name: string;
  completionRate: number;
  schoolCount: number;
}

export interface CategoryStat {
  id: string;
  name: string;
  completionRate: number;
  color: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  pending: number;
}

export interface ChartData {
  activityData: { name: string; value: number }[];
  regionSchoolsData: { name: string; value: number }[];
  categoryCompletionData: { name: string; completed: number }[];
}

// Əsas Dashboard İnterfeysi
export interface DashboardData {
  // Ümumi özəlliklər
  completionRate?: number;
  pendingApprovals?: number;
  notifications?: DashboardNotification[];
  stats?: StatsItem[];
  formsByStatus?: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

// SuperAdmin Dashboard
export interface SuperAdminDashboardData extends DashboardData {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  regionStats: RegionStat[];
}

// RegionAdmin Dashboard
export interface RegionAdminDashboardData extends DashboardData {
  sectors: number;
  schools: number;
  users: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  categories: CategoryStat[];
  sectorCompletions: SectorCompletion[];
}

// SectorAdmin Dashboard
export interface SectorAdminDashboardData extends DashboardData {
  schools: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  schoolStats: SchoolStat[];
  pendingItems: PendingItem[];
  categoryCompletion: CategoryStat[];
  activityLog: ActivityLogItem[];
}

// SchoolAdmin Dashboard
export interface SchoolAdminDashboardData extends DashboardData {
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
    dueSoon: number;
    overdue: number;
  };
  pendingForms: FormItem[];
}

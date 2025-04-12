
export interface FormItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  status: string;
  completionPercentage: number;
  category?: string;
}

export interface FormStatus {
  pending: number;
  approved: number;
  rejected: number;
  dueSoon: number;
  overdue: number;
  total: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  priority: string;
  type: string;
}

export interface StatsItem {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
}

export interface SchoolAdminDashboardData {
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    total: number;
  };
  completionRate: number;
  notifications: Notification[];
  pendingForms: FormItem[];
}

export interface SectorAdminDashboardData {
  schools: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  notifications: Notification[];
  stats?: StatsItem[];
  schoolStats?: { id: string; name: string; completionRate: number; pending: number }[];
  pendingItems?: { id: string; school: string; category: string; date: string; }[];
  categoryCompletion?: { name: string; completionRate: number; color: string; id?: string }[];
  activityLog?: { id: string; action: string; target: string; time: string; }[];
}

export interface RegionAdminDashboardData {
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  notifications: Notification[];
  stats?: StatsItem[];
  categories?: {
    name: string;
    completionRate: number;
    color: string;
    id?: string;
  }[];
  sectorCompletions?: {
    name: string;
    completionRate: number;
    id?: string;
  }[];
}

export interface SuperAdminDashboardData {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  notifications: Notification[];
  stats?: StatsItem[];
  formsByStatus?: {
    pending: number;
    approved: number;
    rejected: number;
  };
  regionStats?: {
    id: string;
    name: string;
    sectorCount: number;
    schoolCount: number;
    completionRate: number;
  }[];
}

export type DashboardData = SuperAdminDashboardData | RegionAdminDashboardData | SectorAdminDashboardData | SchoolAdminDashboardData;

export interface ChartData {
  activityData: Array<{ name: string; value: number }>;
  regionSchoolsData: Array<{ name: string; value: number }>;
  categoryCompletionData: Array<{ name: string; completed: number }>;
}

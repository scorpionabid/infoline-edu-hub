export interface SuperAdminDashboardData {
  stats?: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
  };
  formsByStatus?: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  completionRate: number;
  regions?: RegionStats[];
  notifications: DashboardNotification[];
  pendingApprovals: PendingItem[];
}

export interface RegionAdminDashboardData {
  stats: StatsItem[];
  sectorCompletions: SectorCompletionItem[];
  categories: CategoryStat[];
  completionRate: number;
  pendingApprovals: PendingItem[];
  notifications: DashboardNotification[];
  users?: number;
  schools?: number;
}

export interface SectorAdminDashboardData {
  stats: StatsItem[];
  schoolsStats: SchoolStat[];
  pendingItems: PendingItem[];
  completionRate: number;
  notifications: DashboardNotification[];
  activityLog: ActivityLogItem[];
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
  notifications: DashboardNotification[];
  pendingForms: FormItem[];
}

export interface FormItem {
  id: string;
  title: string;
  category?: string;
  date: string;
  status: FormStatus;
  completionPercentage: number;
}

export enum FormStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DRAFT = 'draft',
  EXPIRED = 'expired',
  DUE_SOON = 'dueSoon',
  COMPLETED = 'completed'
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  time?: string;
  createdAt?: string;
}

export interface PendingItem {
  id: string;
  schoolName: string;
  categoryName: string;
  submittedAt: string;
  dueDate?: string;
  itemTitle?: string;
  school?: string;
  category?: string;
  date?: string;
}

export interface StatsItem {
  label: string;
  value: number;
  description?: string;
  icon?: React.ReactNode;
}

export interface RegionStats {
  id: string;
  name: string;
  schoolCount: number;
  sectorCount: number;
  completionRate: number;
}

export interface SectorCompletionItem {
  id: string;
  name: string;
  regionId?: string;
  regionName?: string;
  schoolCount: number;
  completionRate: number;
}

export interface CategoryStat {
  id: string;
  name: string;
  completionRate: number;
  status: string;
  columnCount: number;
  deadline: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  pendingCount: number;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  target?: string;
  time?: string;
}

export interface ChartData {
  activityData: Array<{ name: string; value: number }>;
  regionSchoolsData: Array<{ name: string; value: number }>;
  categoryCompletionData: Array<{ name: string; completed: number }>;
}

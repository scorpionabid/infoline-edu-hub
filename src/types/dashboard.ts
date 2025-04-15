import { Form } from './form';
import { NotificationType, NotificationPriority } from './notification';

// Dashboard notification interface
export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  userId: string;
  priority: string;
  date: string;
  time: string;
  relatedId?: string;
  relatedType?: string;
}

// Dashboard types for stats and pending items
export interface StatsItem {
  label: string;
  value: number;
  icon?: React.ReactNode;
  description?: string;
}

export interface PendingItem {
  id: string;
  schoolName: string;
  categoryName: string;
  submittedAt?: string;
  dueDate?: string;
}

export interface CategoryStat {
  id: string;
  name: string;
  completionRate: number;
  totalSchools: number;
}

export interface SectorCompletion {
  id: string;
  name: string;
  completionRate: number;
  schoolCount: number;
  sectorCount?: number;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  pendingCount: number;
}

export interface RegionStat {
  id: string;
  name: string;
  schoolCount: number;
  sectorCount: number;
  completionRate: number;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  timestamp: string;
  user: string;
  details: string;
}

// Update Form interface
export interface Form {
  id: string;
  title: string;
  status: FormStatus;
  completionPercentage: number;
  dueDate: string;
  description?: string;
  category?: string;
  deadline?: string;
  date?: string;
}

// Update dashboard data interfaces
export interface SuperAdminDashboardData {
  stats: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
    categories?: number;
    columns?: number;
  };
  regionStats: {
    id: string;
    name: string;
    schoolCount: number;
    completionRate: number;
  }[];
  formsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  completionRate: number;
  pendingApprovals: PendingItem[];
  notifications: DashboardNotification[];
  regions?: RegionStat[];
  sectors?: SectorCompletion[];
  schools?: SchoolStat[];
}

export interface RegionAdminDashboardData {
  sectors: number;
  schools: number;
  users: number;
  stats?: StatsItem[];
  sectorCompletions: SectorCompletion[];
  categories: CategoryStat[];
  pendingApprovals: PendingItem[];
  pendingSchools: {
    id: string;
    name: string;
    sectorName: string;
    completionRate: number;
  }[];
  sectorStats: {
    id: string;
    name: string;
    schoolCount: number;
    completionRate: number;
  }[];
  completionRate: number;
  notifications: DashboardNotification[];
}

export interface SectorAdminDashboardData {
  schools: number;
  users: number;
  stats?: StatsItem[];
  pendingItems: PendingItem[];
  schoolsStats: SchoolStat[];
  activityLog: ActivityLogItem[];
  pendingApprovals: {
    id: string;
    schoolName: string;
    categoryName: string;
    submittedAt: string;
  }[];
  completionRate: number;
  notifications: DashboardNotification[];
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
  pendingForms: Form[];
  completionRate: number;
  notifications: DashboardNotification[];
}

// Dashboard Chart Data
export interface DashboardChartData {
  activityByDate: {
    date: string;
    count: number;
  }[];
  activityBySchool: {
    name: string;
    count: number;
  }[];
}

// Form Item (for dashboards)
export interface FormItem {
  id: string;
  title: string;
  status: string;
  completionPercentage: number;
  dueDate: string;
  description?: string;
}

// Dashboard Data - main type
export type DashboardData = 
  SuperAdminDashboardData | 
  RegionAdminDashboardData | 
  SectorAdminDashboardData | 
  SchoolAdminDashboardData;

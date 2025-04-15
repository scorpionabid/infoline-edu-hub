
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

// SuperAdmin Dashboard Data
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
  pendingApprovals: {
    id: string;
    schoolName: string;
    categoryName: string;
    dueDate: string;
  }[];
  notifications: DashboardNotification[];
}

// RegionAdmin Dashboard Data
export interface RegionAdminDashboardData {
  sectors: number;
  schools: number;
  users: number;
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

// SectorAdmin Dashboard Data
export interface SectorAdminDashboardData {
  schools: number;
  users: number;
  pendingApprovals: {
    id: string;
    schoolName: string;
    categoryName: string;
    submittedAt: string;
  }[];
  schoolsStats: {
    id: string;
    name: string;
    completionRate: number;
    pendingCount: number;
  }[];
  completionRate: number;
  notifications: DashboardNotification[];
}

// SchoolAdmin Dashboard Data
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


import { Notification } from './notification';
import { FormStatus } from './form';

export interface FormItem {
  id: string;
  title: string;
  date: string;
  status: FormStatus;
  completionPercentage: number;
  category?: string;
  deadline?: string;
}

export interface FormCount {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  dueSoon: number;
  overdue: number;
}

export interface FormStatusCount {
  pending: number;
  approved: number;
  rejected: number;
}

export interface SchoolAdminDashboardData {
  forms: FormCount;
  notifications: Notification[];
  completionRate: number;
  pendingForms: FormItem[];
  formsByStatus?: FormStatusCount;
}

export interface RegionAdminDashboardData {
  schools: {
    total: number;
    active: number;
    inactive: number;
  };
  sectors: {
    total: number;
    active: number;
    inactive: number;
  };
  statistics: {
    completionRate: number;
    submissionRate: number;
    approvalRate: number;
  };
  notifications: Notification[];
  recentActivities: any[];
  topSchools: {
    name: string;
    completionRate: number;
  }[];
}

export interface SuperAdminDashboardData {
  regions: {
    total: number;
    active: number;
    inactive: number;
  };
  sectors: {
    total: number;
    active: number;
    inactive: number;
  };
  schools: {
    total: number;
    active: number;
    inactive: number;
  };
  users: {
    total: number;
    active: number;
    inactive: number;
    byRole: {
      superadmin: number;
      regionadmin: number;
      sectoradmin: number;
      schooladmin: number;
    };
  };
  statistics: {
    completionRate: number;
    submissionRate: number;
    approvalRate: number;
  };
  notifications: Notification[];
  recentActivities: any[];
  pendingApprovals?: number;
  completionRate?: number;
}

export interface SectorAdminDashboardData {
  sectors: {
    name: string;
    id: string;
  };
  schools: {
    total: number;
    active: number;
    inactive: number;
  };
  statistics: {
    completionRate: number;
    submissionRate: number;
    approvalRate: number;
  };
  notifications: Notification[];
  pendingForms: FormItem[];
}

export interface DashboardData {
  superAdmin?: SuperAdminDashboardData;
  regionAdmin?: RegionAdminDashboardData;
  sectorAdmin?: SectorAdminDashboardData;
  schoolAdmin?: SchoolAdminDashboardData;
}

export interface StatsItem {
  label: string;
  value: number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export interface ChartData {
  activityData: {
    name: string;
    value: number;
  }[];
  regionSchoolsData: {
    name: string;
    value: number;
  }[];
  categoryCompletionData: {
    name: string;
    value: number;
  }[];
}

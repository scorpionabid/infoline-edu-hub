
import { FormItem, FormStatus } from '@/types/form';
import { Notification } from '@/types/notification';

// Dashboard üçün əsas data tipi
export interface DashboardData {
  // Burada ümumi dashboard məlumatları saxlanılır
  notifications: Notification[];
  activityData: ActivityItem[];
  completionRate: number;
}

// Aktivlik elementi üçün tip
export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  userId: string;
  action?: string;
  actor?: string;
  target?: string;
  time: string;
}

// Chart data üçün tip
export interface ChartData {
  categoryCompletion: {
    name: string;
    completed: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
  }[];
  activityData?: any[];
  regionSchoolsData?: any[];
  categoryCompletionData?: any[];
}

// SuperAdmin dashboard specific data
export interface SuperAdminDashboardData extends DashboardData {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  dueSoonForms?: number;
  overdueForms?: number;
  categoryCompletion: {
    name: string;
    completed: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
  }[];
  pendingForms?: FormItem[];
  completedForms?: FormItem[];
}

// Region admin dashboard specific data
export interface RegionAdminDashboardData extends DashboardData {
  regionName?: string;
  sectors: number;
  schools: number;
  approvalRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  categoryCompletion: {
    name: string;
    completed: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
  }[];
  pendingForms: FormItem[];
}

// Sector admin dashboard specific data
export interface SectorAdminDashboardData extends DashboardData {
  sectorName?: string;
  regionName?: string;
  schools: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  categoryCompletion: {
    name: string;
    completed: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
  }[];
  pendingForms?: FormItem[];
  completedForms?: FormItem[];
}

// School admin dashboard specific data
export interface SchoolAdminDashboardData extends DashboardData {
  schoolName: string;
  sectorName: string;
  regionName: string;
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
  };
  categoryCompletion: {
    name: string;
    completed: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
  }[];
  pendingForms: FormItem[];
  completedForms: FormItem[];
  dueSoonForms: FormItem[];
  overdueForms: FormItem[];
  recentForms?: FormItem[];
}

// Export FormItem tipini də birdə ixrac edək
export { FormItem, FormStatus };

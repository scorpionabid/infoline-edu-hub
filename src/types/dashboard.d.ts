
import { Notification } from './notification';

export interface FormItem {
  id: string;
  title: string;
  dueDate: string | Date;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  categoryId: string;
  categoryName: string;
}

export interface ChartData {
  activityData: Array<{
    name: string;
    value: number;
  }>;
  regionSchoolsData: Array<{
    name: string;
    value: number;
  }>;
  categoryCompletionData: Array<{
    name: string;
    completed: number;
  }>;
}

// Baza dashboard tipləri
export interface DashboardData {
  totalSchools: number;
  totalForms: number;
  pendingForms: FormItem[];
  upcomingDeadlines: FormItem[];
  chartData: ChartData;
}

// SuperAdmin dashboard tipləri
export interface SuperAdminDashboardData extends DashboardData {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  notifications: Notification[];
  pendingSchools?: number;
  approvedSchools?: number;
  rejectedSchools?: number;
  activityData?: Array<{
    id: string;
    action: string;
    actor: string;
    target: string;
    time: string;
  }>;
  statusData?: {
    completed: number;
    pending: number;
    rejected: number;
    notStarted: number;
  };
  regionCompletionData?: Array<{
    name: string;
    completed: number;
  }>;
  sectorCompletionData?: Array<{
    name: string;
    completed: number;
  }>;
  categoryCompletionData?: Array<{
    name: string;
    completed: number;
  }>;
}

// RegionAdmin dashboard tipləri
export interface RegionAdminDashboardData extends DashboardData {
  regionName: string;
  sectors: number;
  schools: number;
  completionRate: number;
  pendingApprovals: number;
  notifications: Notification[];
  categories: Array<{
    id: string;
    name: string;
    itemCount: number;
    completionRate: number;
  }>;
  sectorCompletions: Array<{
    sectorId: string;
    sectorName: string;
    completionRate: number;
  }>;
}

// SectorAdmin dashboard tipləri
export interface SectorAdminDashboardData extends DashboardData {
  sectorName: string;
  regionName: string;
  schools: number;
  pendingApprovals: number;
  completionRate: number;
  approvedForms: number;
  rejectedForms: number;
  notifications: Notification[];
  schoolCompletions: Array<{
    schoolId: string;
    schoolName: string;
    completionRate: number;
  }>;
}

// SchoolAdmin dashboard tipləri
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
  completionRate: number;
  notifications: Notification[];
  recentForms: FormItem[];
}

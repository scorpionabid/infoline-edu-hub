
import { Notification } from './notification';

// Form status-u və Form əşya interfeysi
export interface FormItem {
  id: string;
  title: string; 
  status: 'pending' | 'approved' | 'rejected' | 'overdue' | 'dueSoon' | 'due';
  completionPercentage: number;
  deadline?: string;
  category?: string;
}

export type FormStatus = 'pending' | 'approved' | 'rejected' | 'overdue' | 'dueSoon' | 'due';

// Diaqram məlumatları üçün interfeyslər
export interface ChartData {
  activityData: { name: string; value: number }[];
  regionSchoolsData: { name: string; value: number }[];
  categoryCompletionData: { name: string; completed: number }[];
}

// Əsas Dashboard məlumatları
export interface DashboardData {
  notifications: Notification[];
  isLoading?: boolean;
  error?: Error | null;
  totalSchools?: number;
  activeSchools?: number;
  pendingForms?: FormItem[];
}

// SuperAdmin Dashboard məlumatları
export interface SuperAdminDashboardData extends DashboardData {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  statusData?: { name: string; value: number }[];
}

// Region Admin Dashboard məlumatları
export interface RegionAdminDashboardData extends DashboardData {
  regionName: string;
  sectors: number;
  schools: number;
  approvalRate: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools: number; 
  approvedSchools: number;
  rejectedSchools: number;
  categories?: { name: string; completionRate: number; color: string }[];
}

// Sektor Admin Dashboard məlumatları
export interface SectorAdminDashboardData extends DashboardData {
  sectorName: string;
  regionName: string;
  schools: number;
  pendingApprovals: number;
  completionRate: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
}

// Məktəb Admin Dashboard məlumatları
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
  pendingForms: FormItem[]; // Məcburi sahə əlavə edildi
  recentForms?: FormItem[];
  totalCategories?: number;
  completedCategories?: number;
  pendingCategories?: number;
}


import { Notification } from './notification';

// Form status-u və Form əşya interfeysi
export type FormStatus = 'pending' | 'approved' | 'rejected' | 'overdue' | 'dueSoon' | 'due';

export interface FormItem {
  id: string;
  title: string; 
  status: FormStatus;
  completionPercentage: number;
  deadline?: string;
  category?: string;
}

// Diaqram məlumatları üçün interfeyslər
export interface ChartData {
  activityData: { name: string; value: number }[];
  regionSchoolsData: { name: string; value: number }[];
  categoryCompletionData: { name: string; completed: number }[];
}

// Status data interfeysi
export interface StatusData {
  completed: number;
  pending: number;
  rejected: number;
  notStarted: number;
}

// Əsas Dashboard məlumatları
export interface DashboardData {
  notifications: Notification[];
  isLoading?: boolean;
  error?: Error | null;
  totalSchools?: number;
  activeSchools?: number;
  pendingForms?: FormItem[];
  upcomingDeadlines?: FormItem[];
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
  statusData?: StatusData; // Tipi düzəltdik
  activityData?: { id: string; action: string; actor: string; target: string; time: string; }[];
  categoryCompletionData?: { name: string; completed: number }[];
}

// Region Admin Dashboard məlumatları
export interface RegionAdminDashboardData extends DashboardData {
  regionName: string;
  sectors: number;
  schools: number;
  users?: number; // Əlavə edildi
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
  totalForms?: number; // Əlavə edildi
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
  pendingForms: FormItem[]; // Məcburi sahə
  recentForms?: FormItem[];
  totalCategories?: number;
  completedCategories?: number;
  pendingCategories?: number;
  totalForms?: number; // Əlavə edildi
}

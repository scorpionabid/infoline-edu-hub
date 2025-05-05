
import { Notification } from "./notification";

export interface PendingApprovalItem {
  id: string;
  schoolName: string;
  categoryName: string;
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  schoolId?: string;
  categoryId?: string;
  title?: string;
  date?: string;
  school?: string;
}

export interface RegionStats {
  id: string;
  name: string;
  totalSchools: number;
  schoolCount?: number;
  sectors: number;
  sectorCount?: number;
  completionRate: number;
}

export interface FormItem {
  id: string;
  categoryId?: string;
  categoryName: string;
  deadline: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  completionRate: number;
  submittedAt?: string;
  title?: string; // FormTabs üçün əlavə edildi
  dueDate?: string; // FormTabs üçün əlavə edildi  
  createdAt?: string; // FormTabs üçün əlavə edildi
}

export interface SchoolStats {
  id: string;
  name: string;
  completionRate: number;
  formsCompleted: number;
  formsTotal: number;
}

export interface SchoolStat {
  id: string;
  name: string;
  region: string;
  formStatus: string;
  lastUpdate: string;
  completion: number;
}

export interface SectorStats {
  id: string;
  name: string;
  schoolCount: number;
  completionRate: number;
  pendingApprovals: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalSchools: number;
  totalRegions: number;
  totalSectors: number;
  totalForms?: number;
  totalCategories?: number;
  completionRate?: number;
  pendingApprovals?: number;
}

export interface FormStatusStats {
  draft: number;
  submitted: number;
  approved: number;
  rejected: number;
  incomplete?: number;
  dueSoon?: number;
  overdue?: number;
  total?: number;
}

interface BaseDashboardData {
  completionRate: number;
  stats?: any;
  notifications?: Notification[];
}

export interface SuperAdminDashboardData extends BaseDashboardData {
  stats: {
    totalUsers: number;
    totalSchools: number;
    totalRegions: number;
    totalSectors: number;
  };
  formsByStatus: FormStatusStats;
  regions?: RegionStats[];
  sectors?: SectorStats[];
  pendingApprovals?: PendingApprovalItem[];
  notifications?: Notification[];
  completionRate: number;
  categories?: any[];
}

export interface RegionAdminDashboardData extends BaseDashboardData {
  stats: {
    totalSchools: number;
    totalSectors: number;
    totalForms: number;
    totalCategories: number;
  };
  sectorStats: SectorStats[];
  schoolStats: SchoolStats[];
  pendingApprovals?: PendingApprovalItem[];
  formsByStatus?: FormStatusStats;
  notifications?: Notification[];
  completionRate: number;
}

export interface SectorAdminDashboardData {
  statistics: {
    totalSchools: number;
    activeSchools: number;
    pendingSubmissions: number;
    completedSubmissions: number;
  };
  schools: SchoolStat[];
}

export interface SchoolAdminDashboardData extends BaseDashboardData {
  stats?: any;
  formStats: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
    total: number;
    incomplete?: number;
    dueSoon?: number;
    overdue?: number;
  };
  upcomingDeadlines?: FormItem[];
  recentForms: FormItem[];
  pendingForms?: FormItem[];
  completedForms?: FormItem[];
  completionRate: number;
}

export interface CategoryStat {
  id: string;
  name: string;
  completionRate: number;
  completion?: {
    total: number;
    completed: number;
    percentage: number;
  };
}

export interface ChartData {
  activityData: Array<{ name: string; value: number }>;
  regionSchoolsData: Array<{ name: string; value: number }>;
  categoryCompletionData: Array<{ name: string; completed: number }>;
}

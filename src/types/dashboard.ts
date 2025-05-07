import { AppNotification, DashboardNotification } from './notification';
import { Region, Sector, SchoolStat } from './school';

// Dashboard stats
export interface DashboardStats {
  totalUsers: number;
  totalSchools: number;
  totalRegions: number;
  totalSectors: number;
  schools?: SchoolStat[] | {
    total: number;
    active: number;
    inactive: number;
  };
  forms?: FormStats;
  categories?: number | {
    total: number;
    active: number;
    upcoming: number;
    expired: number;
  };
  users?: number | {
    total: number;
    active: number;
    pending: number;
  };
  sectors?: any[];
  regions?: any[];
}

// Region admin dashboard data
export interface RegionAdminDashboardProps {
  data: RegionAdminDashboardData;
}

export interface RegionAdminDashboardData {
  completion: {
    percentage: number;
    total: number;
    completed: number;
  };
  status: FormStats;
  categories: CategoryItem[];
  sectors: SectorCompletionItem[];
  notifications: DashboardNotification[];
  pendingApprovals: PendingApproval[];
  schoolStats?: SchoolStat[];
  stats?: {
    totalSectors?: number;
    totalSchools?: number;
    totalForms?: number;
    totalCategories?: number;
    completion_rate?: number;
    pending_count?: number;
    pending_schools?: number;
    total_entries?: number;
  };
  sectorStats?: any[];
  completionRate?: number;
}

// Category item
export interface CategoryItem {
  id: string;
  name: string;
  progress: number;
  dueDate?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'late' | 'notStarted';
  completion?: {
    total: number;
    completed: number;
    percentage: number;
  };
  completionRate?: number;
}

// Əksik eksport edilən Dashboard tiplərini əlavə edək
export interface DashboardCategory {
  id: string;
  name: string;
  description?: string;
  submissionCount: number;
  completionPercentage: number;
  deadline?: string;
  status: string;
}

export interface CategoryWithCompletion {
  id: string;
  name: string;
  completionRate: number;
  formsCompleted: number;
  totalForms: number;
}

export interface SchoolCompletionItem {
  id: string;
  name: string;
  completionRate: number;
}

// Sector completion item
export interface SectorCompletionItem {
  id: string;
  name: string;
  completionRate: number;
  schoolsCount: number;
  pendingCount?: number;
}

// Deadline item
export interface DeadlineItem {
  id: string;
  title: string;
  categoryId: string;
  category?: string;
  deadline: string;
  daysRemaining: number;
  completionRate: number;
}

// Form item
export interface FormItem {
  id: string;
  title: string;
  category?: string;
  categoryName?: string;
  categoryId: string;
  deadline: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  submittedDate?: string;
}

// Form stats
export interface FormStats {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  total: number;
  incomplete?: number;
  dueSoon?: number; 
  overdue?: number;
}

// School admin dashboard props
export interface SchoolAdminDashboardProps {
  data?: SchoolAdminDashboardData;
  isLoading?: boolean;
  error?: any;
  onRefresh?: () => void;
  handleFormClick?: (id: string) => void;
  navigateToDataEntry?: () => void;
  schoolId?: string;
}

// School admin dashboard data
export interface SchoolAdminDashboardData {
  completion: {
    percentage: number;
    total: number;
    completed: number;
  };
  status: FormStats;
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  forms?: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    total: number;
  };
  formStats?: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
    total: number;
    incomplete?: number;
    dueSoon?: number;
    overdue?: number;
  };
  pendingForms: FormItem[];
  completionRate: number;
  notifications: DashboardNotification[];
  recentForms?: FormItem[];
  upcomingDeadlines?: DeadlineItem[];
}

// Sektor admininin dashboard məlumatları üçün tip
export interface SectorAdminDashboardData {
  schoolStats: SchoolStat[];
  completion: {
    percentage: number;
    total: number;
    completed: number;
  };
  status: FormStats;
  pendingApprovals: PendingApproval[];
  notifications: DashboardNotification[];
  schools?: any[];
}

export interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
}

// Pending approval item
export interface PendingApproval {
  id: string;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  date: string;
  submittedAt?: string;
  submittedDate?: string;
  submittedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  category?: string;
  school?: any;
}

export type PendingApprovalItem = PendingApproval;

export interface CompletionStats {
  totalCategories: number;
  completedCategories: number;
  completionRate: number;
}

// Super admin dashboard data
export interface SuperAdminDashboardData {
  stats: {
    regions?: number;
    sectors?: number;
    schools: number;
    users?: number;
  };
  formsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  completionRate: number;
  pendingApprovals?: PendingApproval[];
  regions?: any[];
  notifications: AppNotification[];
  categories?: CategoryItem[];
}

export interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

// Qrafik məlumatları üçün tiplər
export interface ChartData {
  activityData: Array<{name: string, value: number}>;
  regionSchoolsData: Array<{name: string, value: number}>;
  categoryCompletionData: Array<{name: string, completed: number}>;
}

// Status kartları üçün props tipi
export interface StatusCardsProps {
  completion: { total: number; completed: number; percentage: number };
  status: { pending: number; approved: number; rejected: number; total: number };
  formStats?: FormStats;
}

// SchoolStat tipini də ixrac edək
export { SchoolStat };

// DashboardNotification tipini də ixrac edək
export { DashboardNotification };

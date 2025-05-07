
import { AppNotification, DashboardNotification } from './notification';
import { Region, Sector, SchoolStat } from './school';

// Dashboard stats
export interface DashboardStats {
  totalUsers: number;
  totalSchools: number;
  totalRegions: number;
  totalSectors: number;
  schools?: SchoolStat[];
  forms?: FormStats;
  categories?: number;
  users?: number;
  sectors?: any[];
  regions?: any[];
}

// Region admin dashboard data
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
}

// Category item
export interface CategoryItem {
  id: string;
  name: string;
  progress: number;
  dueDate?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'late' | 'notStarted';
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
  deadline: string;
  daysRemaining: number;
  completionRate: number;
}

// Form item
export interface FormItem {
  id: string;
  title: string;
  category: string;
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
  incomplete?: number; // Opsional xüsusiyyət
  dueSoon?: number; // Opsional xüsusiyyət
  overdue?: number; // Opsional xüsusiyyət 
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
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    total: number;
  };
  pendingForms: FormItem[];
  completionRate: number;
  notifications: DashboardNotification[];
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

// Pending approval item
export interface PendingApproval {
  id: string;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export type PendingApprovalItem = PendingApproval;

export interface CompletionStats {
  totalCategories: number;
  completedCategories: number;
  completionRate: number;
}


// Dashboard data types for various roles

export interface DashboardStatus {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  active?: number;
  inactive?: number;
}

export interface DashboardFormStats {
  total: number;
  completed: number;
  pending: number;
  percentage: number;
  approved?: number;
  rejected?: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  completion: number;
  status: string;
  totalColumns?: number;
  completedColumns?: number;
  categoryId?: string;
  description?: string;
  deadline?: string;
  daysLeft?: number;
  completionRate?: number;
}

export interface FormItem {
  id: string;
  name: string;
  status: string;
  completion: number;
  dueDate?: string;
  title?: string;
  categoryName?: string;
  category?: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  deadline: string;
  daysLeft: number;
  categoryId?: string;
}

export interface PendingApproval {
  id: string;
  name?: string;
  school?: string;
  category?: string;
  submittedAt: string;
  submittedBy?: string;
  // Additional properties used in components
  status?: 'pending' | 'approved' | 'rejected';
  schoolId?: string;
  schoolName?: string;
  categoryId?: string;
  categoryName?: string;
  createdAt?: string;
  title?: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completion: number;
  principalName?: string;
  email?: string;
  phone?: string;
}

export interface SectorStat {
  id: string;
  name: string;
  completion: number;
  schoolCount?: number;
}

export interface SchoolAdminDashboardData {
  status: DashboardStatus;
  forms: FormItem[];
  categories: CategoryItem[];
  completion: DashboardFormStats;
  deadlines: DeadlineItem[];
  recentActivity?: any[];
  notifications?: any[];
}

export interface SectorAdminDashboardData {
  status: DashboardStatus;
  completion: DashboardFormStats;
  schoolStats: SchoolStat[];
  pendingApprovals: PendingApproval[];
  categories: CategoryItem[];
  deadlines: DeadlineItem[];
  recentActivity?: any[];
}

export interface RegionAdminDashboardData {
  status: DashboardStatus;
  completion: DashboardFormStats;
  sectorStats: SectorStat[];
  schoolStats: SchoolStat[];
  pendingApprovals: PendingApproval[];
  categories: CategoryItem[];
  deadlines: DeadlineItem[];
}

export interface SuperAdminDashboardData {
  status: DashboardStatus;
  completion: DashboardFormStats;
  regionStats: any[];
  sectorStats: SectorStat[];
  pendingApprovals: PendingApproval[];
  categories: CategoryItem[];
  recentActivity?: any[];
}

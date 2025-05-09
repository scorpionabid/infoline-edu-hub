
// Add missing types for dashboard data

export interface RegionStat {
  id: string;
  name: string;
  sectorCount: number;
  schoolCount: number;
  completionRate: number;
}

export interface SectorStat {
  id: string;
  name: string;
  schoolCount: number;
  completionRate: number;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  pendingCount?: number;
  lastUpdate?: string;
  status?: string;
  pendingForms?: number;
  formsCompleted?: number;
  totalForms?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface CategoryStat {
  id: string;
  name: string;
  completionRate: number;
  status: string;
  deadline: string;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface DashboardFormStats {
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  dueSoon: number;
  overdue: number;
  total: number;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: string;
  isRead: boolean;
}

export interface PendingApproval {
  id: string;
  schoolId?: string;
  schoolName: string;
  categoryId?: string;
  categoryName: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  createdAt: string;
  submittedAt: string;
  count?: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  completionRate: number;
  status?: string;
}

export interface DeadlineItem {
  id: string;
  categoryId: string;
  categoryName: string;
  dueDate: string;
  status: string;
  completionRate: number;
}

export interface FormItem {
  id: string;
  categoryId: string;
  categoryName: string;
  status: string;
  completionRate: number;
  submittedAt: string;
}

// Add missing interfaces for different dashboard types
export interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
  sectorId: string;
}

export interface SectorAdminDashboardData {
  completion: {
    percentage: number;
    total: number;
    completed: number;
  };
  status: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
    active: number;
    inactive: number;
  };
  formStats: DashboardFormStats;
  pendingApprovals: PendingApproval[];
  schoolStats: SchoolStat[];
  upcomingDeadlines?: DeadlineItem[];
}


export interface CategoryItem {
  id: string;
  name: string;
  completionRate: number;
  status: 'completed' | 'in-progress' | 'not-started' | string;
  description?: string;
  deadline?: string;
  daysLeft?: number;
}

export interface FormItem {
  id: string;
  title: string;
  categoryName: string;
  categoryId?: string;
  status: string;
  deadline: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  categoryName: string;
  categoryId?: string;
  deadline: string;
  daysLeft: number;
  status?: string;
}

export interface PendingApproval {
  id: string;
  title: string;
  schoolName?: string;
  categoryName?: string;
  schoolId?: string;
  categoryId?: string;
  submittedBy?: string;
  submittedAt?: string;
  createdAt?: string;
  status: string;
}

export interface StatusCardsProps {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  total: number;
  active?: number;
  inactive?: number;
}

export interface DashboardStatus {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  total: number;
  active?: number;
  inactive?: number;
}

export interface DashboardFormStats {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  dueSoon: number;
  overdue: number;
  total: number;
  completed?: number;
  percentage?: number;
}

export interface SchoolAdminDashboardData {
  completion: {
    percentage: number;
    total: number;
    completed: number;
  } | number;
  completionRate?: number;
  status: DashboardStatus;
  formStats: DashboardFormStats;
  categories: CategoryItem[];
  pendingForms: FormItem[];
  upcoming: DeadlineItem[];
  notifications?: any[];
}

export interface SectorAdminDashboardData {
  completion: {
    percentage: number;
    total: number;
    completed: number;
  } | number;
  status: DashboardStatus;
  formStats: DashboardFormStats;
  categories?: CategoryItem[];
  schools: SchoolStat[];
  pendingApprovals: PendingApproval[];
}

export interface RegionAdminDashboardData {
  completion: {
    percentage: number;
    total: number;
    completed: number;
  } | number;
  status: DashboardStatus;
  formStats: DashboardFormStats;
  sectors: SectorStat[];
  pendingApprovals: PendingApproval[];
}

export interface SuperAdminDashboardData {
  completion: {
    percentage: number;
    total: number;
    completed: number;
  } | number;
  status: DashboardStatus;
  formStats: DashboardFormStats;
  regions: RegionStat[];
  categories: CategoryItem[];
  pendingApprovals: PendingApproval[];
}

export interface SchoolStat {
  id: string;
  name: string;
  completion: {
    percentage: number;
    total: number;
    completed: number;
  };
  status: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
  };
  completionRate?: number;
  lastUpdate?: string;
  pendingCount?: number;
  pendingEntries?: number;
  totalEntries?: number;
  pendingForms?: number;
  formsCompleted?: number;
  totalForms?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface SectorStat {
  id: string;
  name: string;
  completion: {
    percentage: number;
    total: number;
    completed: number;
  };
  status: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
  };
  schoolCount: number;
}

export interface RegionStat {
  id: string;
  name: string;
  completion: {
    percentage: number;
    total: number;
    completed: number;
  };
  status: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
  };
  sectorCount: number;
  schoolCount: number;
}

export interface FormTabsProps {
  categories: CategoryItem[];
  pendingForms: FormItem[];
  upcoming: DeadlineItem[];
  navigateToDataEntry?: () => void;
  handleFormClick?: (id: string) => void;
}

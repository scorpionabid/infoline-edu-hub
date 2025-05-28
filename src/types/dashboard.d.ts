
export interface StatusCardsProps {
  completedCount: number;
  pendingCount: number;
  rejectedCount: number;
  totalCount: number;
  isLoading?: boolean;
}

export interface DashboardStatus {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
}

export interface DashboardFormStats {
  total: number;
  completed: number;
  pending: number;
  rejected: number;
  approved: number;
  draft: number;
  dueSoon: number;
  overdue: number;
  completion_rate: number;
  percentage: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  status: string;
  completion_rate?: number;
  completion?: number;
  completionRate?: number;
  deadline?: string;
  priority?: number;
  columnCount?: number;
}

export interface FormItem {
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  created_at: string;
  updated_at?: string;
  school_id?: string;
  category_id?: string;
  title?: string;
  category?: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  name: string;
  deadline: string;
  dueDate?: string;
  daysLeft: number;
  priority?: 'high' | 'medium' | 'low';
  status?: string;
  category_id?: string;
}

export interface PendingApproval {
  id: string;
  title: string;
  type: string;
  created_at: string;
  school_name?: string;
  schoolName?: string;
  sectorName?: string;
  regionName?: string;
  category_name?: string;
  categoryName?: string;
  date?: string;
  submittedAt?: string;
  createdAt?: string;
  status: 'pending';
}

export interface SchoolStat {
  id: string;
  name: string;
  completion_rate: number;
  completionRate: number;
  total_entries?: number;
  totalEntries?: number;
  pending_entries?: number;
  pendingEntries?: number;
  pendingCount?: number;
  pendingForms?: number;
  approved_entries?: number;
  status?: 'active' | 'inactive';
  region_id?: string;
  sector_id?: string;
  formsCompleted?: number;
  totalForms?: number;
  lastUpdate?: string;
}

export interface SectorStat {
  id: string;
  name: string;
  completion_rate: number;
  completionRate: number;
  completion?: number;
  total_schools: number;
  schoolCount: number;
  pending_approvals: number;
  approved_entries: number;
  region_id?: string;
}

export interface SuperAdminDashboardData {
  stats: DashboardFormStats;
  categories: CategoryItem[];
  pendingApprovals: PendingApproval[];
  upcomingDeadlines: DeadlineItem[];
  regionStats: any[];
  sectorStats: SectorStat[];
  schoolStats: SchoolStat[];
  notifications?: any[];
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number | null;
  completionRate?: number;
  categoryData?: CategoryItem[];
  users: {
    active: number;
    total: number;
  };
  regionCount: number;
  sectorCount: number;
  schoolCount: number;
  entryCount?: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    draft: number;
  };
}

export interface RegionAdminDashboardData {
  stats: DashboardFormStats;
  formStats: DashboardFormStats;
  status: DashboardStatus;
  categories: CategoryItem[];
  pendingApprovals: PendingApproval[];
  upcomingDeadlines: DeadlineItem[];
  sectorStats: SectorStat[];
  schoolStats: SchoolStat[];
  notifications?: any[];
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number | null;
  completionRate?: number;
}

export interface SectorAdminDashboardData {
  stats: DashboardFormStats;
  formStats: DashboardFormStats;
  status: DashboardStatus;
  categories: CategoryItem[];
  pendingApprovals: PendingApproval[];
  upcomingDeadlines: DeadlineItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  schoolStats: SchoolStat[];
  schools?: SchoolStat[] | DashboardStatus;
  notifications?: any[];
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number | null;
  completionRate?: number;
}

export interface SchoolAdminDashboardData {
  stats: DashboardFormStats;
  formStats: DashboardFormStats;
  status: DashboardStatus;
  categories: CategoryItem[];
  upcomingDeadlines: DeadlineItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  completion: {
    percentage: number;
    total: number;
    completed: number;
  } | number | null;
  completionRate?: number;
  notifications?: any[];
}

export interface FormTabsProps {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  navigateToDataEntry?: () => void;
  handleFormClick?: (id: string) => void;
}

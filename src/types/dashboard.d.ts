
export interface FormItem {
  id: string;
  name?: string;
  title?: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  dueDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'not_started' | 'in_progress' | 'overdue';
  lastModified: string;
  completionRate?: number;
  progress?: number;
  submissions?: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  status: string;
  completionRate: number;
  completion?: number;
  deadline?: string;
  totalFields?: number;
  completedFields?: number;
  lastUpdated?: string;
}

export interface DeadlineItem {
  id: string;
  name?: string;
  title?: string;
  deadline: string;
  dueDate: string;
  status: string;
  daysLeft?: number;
  priority?: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
}

export interface SectorStat {
  id: string;
  name: string;
  schoolCount?: number;
  totalSchools: number;
  activeSchools: number;
  completionRate: number;
  completion?: number;
  completion_rate?: number;
  status: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  totalForms: number;
  completedForms: number;
  pendingForms: number;
  status: string;
  lastUpdated: string;
  totalEntries?: number;
  total_entries?: number;
  pendingEntries?: number;
  pending_entries?: number;
  pendingCount?: number;
  completion?: number;
  formsCompleted?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface PendingApproval {
  id: string;
  schoolName: string;
  categoryName: string;
  date: string;
  status?: string;
  submittedAt?: string;
  submittedBy?: string;
  title?: string;
  count?: number;
}

export interface DashboardFormStats {
  totalForms?: number;
  completedForms?: number;
  pendingForms?: number;
  approvalRate?: number;
  completed: number;
  pending: number;
  total?: number;
  approved?: number;
  rejected?: number;
  draft?: number;
  dueSoon?: number;
  overdue?: number;
  percentage?: number;
  completion_rate?: number;
  completionRate?: number;
}

export interface DashboardChartProps {
  stats: DashboardFormStats;
  showLegend?: boolean;
  height?: number;
}

export interface FormTabsProps {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  navigateToDataEntry?: () => void;
  handleFormClick?: (id: string) => void;
  onCategoryChange?: (categoryId: string) => void;
}

export interface SuperAdminDashboardData {
  forms?: FormItem[];
  stats?: DashboardFormStats;
  categories?: CategoryItem[];
  deadlines?: DeadlineItem[];
  totalRegions: number;
  totalSectors: number;
  totalSchools: number;
  totalUsers: number;
  pendingApprovals: PendingApproval[];
  regionStats: any[];
  regions?: any[];
  formsByStatus?: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  regionCount: number;
  sectorCount: number;
  schoolCount: number;
  userCount: number;
  approvalRate: number;
  completionRate: number;
  notifications: any[];
}

export interface RegionAdminDashboardData {
  forms?: FormItem[];
  stats?: DashboardFormStats;
  categories?: CategoryItem[];
  deadlines?: DeadlineItem[];
  sectors?: SectorStat[];
  pendingItems?: any[];
  notifications?: any[];
  completionRate: number;
  formStats: DashboardFormStats;
}

export interface SectorAdminDashboardData {
  forms?: FormItem[];
  stats?: DashboardFormStats;
  categories?: CategoryItem[];
  deadlines?: DeadlineItem[];
  schools?: SchoolStat[];
  pendingItems?: any[];
  notifications?: any[];
  completionRate: number;
}

export interface SchoolAdminDashboardData {
  categories?: CategoryItem[];
  deadlines?: DeadlineItem[];
  stats?: {
    completed: number;
    pending: number;
  };
  formStats?: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    drafts: number;
    incomplete: number;
    dueSoon?: number;
  };
  notifications?: any[];
  completionRate: number;
  status?: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
    total: number;
    active: number;
    inactive: number;
  };
  completion?: {
    percentage: number;
    completed: number;
    total: number;
  };
  pendingForms?: FormItem[];
  upcoming?: DeadlineItem[];
}

export type DashboardStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'not_started' | 'in_progress' | 'overdue';

export interface StatsGridItem {
  title: string;
  value: string | number;
  color?: string;
  description?: string;
}

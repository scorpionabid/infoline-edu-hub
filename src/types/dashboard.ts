
export interface SuperAdminDashboardData {
  totalSchools: number;
  totalUsers: number;
  totalCategories: number;
  pendingApprovals: number;
  completionRate: number;
  stats: DashboardStats;
  forms: DashboardFormStats;
  userCount?: number;
  totalRegions?: number;
  formsByStatus?: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  approvalRate?: number;
  regions?: any[];
}

export interface RegionAdminDashboardData {
  totalSectors: number;
  totalSchools: number;
  pendingApprovals: number;
  completionRate: number;
  stats: DashboardStats;
  forms: DashboardFormStats;
  deadlines?: any[];
  formStats?: DashboardFormStats;
  sectors?: any[];
  categories?: CategoryItem[];
}

export interface SectorAdminDashboardData {
  totalSchools: number;
  pendingApprovals: number;
  completionRate: number;
  stats: DashboardStats;
  forms: DashboardFormStats;
  formStats?: DashboardFormStats;
  schools?: any[];
  categories?: CategoryItem[];
}

export interface SchoolAdminDashboardData {
  totalForms: number;
  completedForms: number;
  pendingForms: number;
  stats: DashboardStats;
  forms: DashboardFormStats;
}

export interface DashboardStats {
  totalEntries: number;
  completedEntries: number;
  pendingEntries: number;
  approvedEntries: number;
  rejectedEntries: number;
  completed?: number;
  pending?: number;
}

export interface DashboardFormStats {
  totalForms: number;
  pendingApprovals: number;
  rejectedForms: number;
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  dueSoon: number;
  overdue: number;
  percentage: number;
  completion_rate: number;
  completionRate: number;
  completedForms: number;
  pendingForms: number;
  approvalRate: number;
  completed: number;
}

export interface EnhancedDashboardData {
  [key: string]: any;
}

export interface CategoryProgress {
  id: string;
  name: string;
  progress: number;
}

export interface ColumnStatus {
  id: string;
  name: string;
  status: string;
}

// Additional missing dashboard types
export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  completionRate?: number;
  completion?: number;
  status?: string;
  deadline?: string;
  totalFields?: number;
  completedFields?: number;
  lastUpdated?: string;
}

export interface StatsGridItem {
  title: string;
  value: string | number;
  description?: string;
  color?: string;
  icon?: string;
}

export interface DashboardChartProps {
  stats: DashboardFormStats;
  showLegend?: boolean;
  height?: number;
}

export interface FormItem {
  id: string;
  name?: string;
  title?: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  dueDate?: string;
  status: string;
  lastModified?: string;
  progress?: number;
}

export interface DeadlineItem {
  id: string;
  name?: string;
  title?: string;
  deadline: string;
  daysLeft?: number;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  totalEntries?: number;
  total_entries?: number;
  pendingEntries?: number;
  pending_entries?: number;
  pendingCount?: number;
  completion?: number;
  status?: string;
  lastUpdate?: string;
  formsCompleted?: number;
  totalForms?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
  pendingForms?: number;
  completedForms?: number;
  completed?: number;
  total?: number;
  percentage?: number;
}

export interface SectorStat {
  id: string;
  name: string;
  schoolCount: number;
  completionRate: number;
  completion?: number;
  completion_rate?: number;
  totalSchools?: number;
}

export interface PendingApproval {
  id: string;
  schoolId?: string;
  schoolName: string;
  categoryId?: string;
  categoryName: string;
  submittedBy?: string;
  submittedAt: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  title?: string;
  count?: number;
  date?: string;
}

export interface FormTabsProps {
  categories?: CategoryItem[];
  deadlines?: DeadlineItem[];
  forms?: FormItem[];
  upcoming?: DeadlineItem[];
  pendingForms?: FormItem[];
  navigateToDataEntry?: (categoryId: string) => void;
  handleFormClick?: (formId: string) => void;
  onCategoryChange?: (categoryId: string) => void;
}


// Dashboard types with proper structure
export interface DashboardFormStats {
  totalForms: number;
  completedForms: number;
  pendingApprovals: number;
  rejectedForms: number;
  totalRegions?: number;
  totalSectors?: number;
  totalSchools?: number;
  pendingForms?: number;
  approved?: number;
  pending?: number;
  rejected?: number;
  percentage?: number;
  approvalRate?: number;
  completion_rate?: number;
  completionRate?: number;
  draft?: number;
  dueSoon?: number;
  overdue?: number;
  total?: number;
  completed?: number;
}

export interface SuperAdminDashboardData {
  stats: DashboardFormStats;
  totalRegions: number;
  totalSectors: number;
  totalSchools: number;
  totalUsers: number;
  regionStats: any[];
  approvalRate: number;
  completionRate: number;
  regions: any[];
  pendingApprovals: any[];
  notifications: any[];
  formsByStatus: any;
  users?: number;
  regionCount?: number;
  sectorCount?: number;
  schoolCount?: number;
  entryCount?: number;
  completion?: number;
  categoryData?: any;
  schoolData?: any;
  regionData?: any;
}

export interface RegionAdminDashboardData {
  stats: DashboardFormStats;
  formStats: DashboardFormStats;
  pendingItems: any[];
  categories: any[];
  sectors: any[];
  notifications: any[];
  completionRate: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  progress: number;
  status: string;
  completionRate?: number;
  completion?: number;
  description?: string;
  deadline?: string;
  totalFields?: number;
  completedFields?: number;
  lastUpdated?: string;
}

export interface StatsGridItem {
  title: string;
  value: string | number;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  description?: string;
}

export interface DashboardChartProps {
  data?: any[];
  title?: string;
  type?: 'bar' | 'line' | 'pie';
  stats?: DashboardFormStats;
  showLegend?: boolean;
  height?: number;
}

export interface PendingApproval {
  id: string;
  title: string;
  school: string;
  submittedAt: string;
  priority: 'high' | 'medium' | 'low';
  schoolName?: string;
  categoryName?: string;
  date?: string;
}

export interface FormItem {
  id: string;
  name: string;
  deadline: string;
  status: 'completed' | 'pending' | 'overdue';
  progress: number;
  title?: string;
  category?: string;
  lastModified?: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completed: number;
  total: number;
  percentage: number;
  status: string;
  completionRate?: number;
  totalEntries?: number;
  total_entries?: number;
  pendingEntries?: number;
  pending_entries?: number;
  pendingCount?: number;
  pendingForms?: number;
  completedForms?: number;
  totalForms?: number;
  lastUpdated?: string;
}

export interface SectorStat {
  id: string;
  name: string;
  schools: number;
  completed: number;
  total: number;
  percentage: number;
  completionRate?: number;
  completion_rate?: number;
  completion?: number;
  schoolCount?: number;
  totalSchools?: number;
}

export interface DeadlineItem {
  id: string;
  title: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  daysLeft: number;
  name?: string;
  status?: string;
}

export interface FormTabsProps {
  categories: CategoryItem[];
  deadlines: DeadlineItem[];
  forms: FormItem[];
  upcoming?: DeadlineItem[];
  pendingForms?: FormItem[];
  navigateToDataEntry?: (categoryId: string) => void;
  handleFormClick?: (formId: string) => void;
  onCategoryChange?: (categoryId: string) => void;
}

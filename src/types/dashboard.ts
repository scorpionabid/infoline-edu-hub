
export interface DashboardFormStats {
  total: number;
  completed: number;
  approved: number;
  pending: number;
  rejected: number;
  draft: number;
  dueSoon: number;
  overdue: number;
  percentage: number;
  completion_rate: number;
  completionRate: number;
  active?: {
    schools?: number;
    regions?: number;
    sectors?: number;
    users?: number;
  };
  inactive?: {
    schools?: number;
    regions?: number;
    sectors?: number;
    users?: number;
  };
}

export interface SuperAdminDashboardData {
  totalSchools: number;
  totalRegions: number;
  totalSectors: number;
  totalUsers: number;
  active: {
    schools: number;
    regions: number;
    sectors: number;
    users: number;
  };
  completion: number;
  completionRate: number;
  entryCount: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    draft: number;
    completed: number;
    percentage: number;
  };
  schoolData: any[];
  regionData: any[];
  categoryData: any[];
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'approved' | 'rejected' | 'pending' | 'overdue';
  completionRate: number;
  completion?: number;
  totalFields?: number;
  completedFields?: number;
  lastUpdated?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface DeadlineItem {
  id: string;
  name: string;
  title?: string;
  deadline: string;
  daysLeft: number;
  status: 'upcoming' | 'overdue' | 'completed';
  priority?: 'high' | 'medium' | 'low';
}

export interface FormItem {
  id: string;
  name: string;
  title?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  lastModified: string;
  completionRate: number;
  progress?: number;
  category?: string;
}

export interface PendingApproval {
  id: string;
  schoolName: string;
  categoryName: string;
  date: string;
  submittedAt?: string;
  created_at?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  completion_rate?: number;
  totalForms: number;
  completedForms: number;
  pendingForms: number;
  totalEntries?: number;
  total_entries?: number;
  pendingEntries?: number;
  pending_entries?: number;
  pendingCount?: number;
  formsCompleted?: number;
  status: 'active' | 'inactive';
  lastUpdated: string;
  lastUpdate?: string;
}

export interface SectorStat {
  id: string;
  name: string;
  schoolCount: number;
  completionRate: number;
  completion_rate?: number;
  completion?: number;
  totalSchools: number;
  total_schools?: number;
  activeSchools: number;
  status: 'active' | 'inactive';
}

export interface RegionAdminDashboardData {
  stats: DashboardFormStats;
  status?: DashboardFormStats;
  formStats?: DashboardFormStats;
  completion?: any;
  completionRate?: number;
  sectors: SectorStat[];
  sectorStats?: SectorStat[];
  schools: SchoolStat[];
  schoolStats?: SchoolStat[];
  recentActivity: any[];
  pendingApprovals?: any[];
  categories?: any[];
  upcomingDeadlines?: any[];
}

export interface SectorAdminDashboardData {
  stats: DashboardFormStats;
  status?: DashboardFormStats;
  formStats?: DashboardFormStats;
  schools: SchoolStat[];
  schoolStats?: SchoolStat[];
  recentActivity: any[];
  alerts: any[];
  completion?: {
    total: number;
    completed: number;
    percentage: number;
  };
  completionRate?: number;
  pendingApprovals?: any[];
  categories?: any[];
  upcoming?: any[];
  pendingForms?: any[];
}

export interface SchoolAdminDashboardData {
  categories: CategoryItem[];
  upcomingDeadlines: DeadlineItem[];
  upcoming?: DeadlineItem[];
  pendingForms: FormItem[];
  recentActivity: any[];
  status?: any;
  formStats?: any;
  completion?: any;
  notifications?: any[];
  completionRate?: number;
}

export interface FormTabsProps {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  navigateToDataEntry: () => void;
  handleFormClick: (id: string) => void;
  onCategoryChange?: (categoryId: string) => void;
}

export interface StatsGridItem {
  title: string;
  value: string | number;
  color?: string;
  description?: string;
}

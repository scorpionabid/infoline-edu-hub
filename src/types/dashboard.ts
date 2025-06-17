
// Dashboard types with proper structure
export interface DashboardFormStats {
  totalForms: number;
  completedForms: number;
  pendingApprovals: number;
  rejectedForms: number;
  totalRegions?: number;
  totalSectors?: number;
  totalSchools?: number;
  // Əlavə olunmuş xassələr
  pendingForms?: number;
  approved?: number;
  pending?: number;
  rejected?: number;
  percentage?: number;
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

// Əlavə tip definisiyaları
export interface CategoryItem {
  id: string;
  name: string;
  progress: number;
  status: string;
}

export interface StatsGridItem {
  title: string;
  value: string | number;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface DashboardChartProps {
  data: any[];
  title: string;
  type?: 'bar' | 'line' | 'pie';
}

export interface PendingApproval {
  id: string;
  title: string;
  school: string;
  submittedAt: string;
  priority: 'high' | 'medium' | 'low';
}

export interface FormItem {
  id: string;
  name: string;
  deadline: string;
  status: 'completed' | 'pending' | 'overdue';
  progress: number;
}

export interface SchoolStat {
  id: string;
  name: string;
  completed: number;
  total: number;
  percentage: number;
  status: string;
}

export interface SectorStat {
  id: string;
  name: string;
  schools: number;
  completed: number;
  total: number;
  percentage: number;
}

export interface DeadlineItem {
  id: string;
  title: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  daysLeft: number;
}

export interface FormTabsProps {
  categories: CategoryItem[];
  deadlines: DeadlineItem[];
  forms: FormItem[];
}

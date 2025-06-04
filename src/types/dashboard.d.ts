export interface FormItem {
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'not_started' | 'in_progress' | 'overdue';
  lastModified: string;
  completionRate: number;
  submissions?: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  status: string;
  completionRate: number;
}

export interface DeadlineItem {
  id: string;
  name: string;
  deadline: string;
  dueDate: string;
  status: string;
  daysLeft: number;
}

export interface SectorStat {
  id: string;
  name: string;
  schoolCount: number;
  totalSchools: number;
  activeSchools: number;
  completionRate: number;
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
}

export interface DashboardFormStats {
  totalForms: number;
  completedForms: number;
  pendingForms: number;
  approvalRate: number;
}

export interface DashboardCategoryStats {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
}

export interface DashboardSchoolStats {
  totalSchools: number;
  activeSchools: number;
  inactiveSchools: number;
}

export interface DashboardSectorStats {
  totalSectors: number;
  activeSectors: number;
  inactiveSectors: number;
}

export interface DashboardRegionStats {
  totalRegions: number;
  activeRegions: number;
  inactiveRegions: number;
}

export interface SuperAdminDashboardData {
  forms: FormItem[];
  stats: DashboardFormStats;
  categories: CategoryItem[];
  deadlines: DeadlineItem[];
  schools: DashboardSchoolStats;
  sectors: DashboardSectorStats;
  regions: DashboardRegionStats;
}

export interface RegionAdminDashboardData {
  forms: FormItem[];
  stats: DashboardFormStats;
  categories: CategoryItem[];
  deadlines: DeadlineItem[];
  sectors: SectorStat[];
}

export interface SectorAdminDashboardData {
  forms: FormItem[];
  stats: DashboardFormStats;
  categories: CategoryItem[];
  deadlines: DeadlineItem[];
  schools: SchoolStat[];
}

export interface SchoolAdminDashboardData {
  forms: FormItem[];
  stats: DashboardFormStats;
  categories: CategoryItem[];
  deadlines: DeadlineItem[];
}

export type DashboardStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'not_started' | 'in_progress' | 'overdue';

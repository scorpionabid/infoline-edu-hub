export interface RegionItem {
  id: string;
  name: string;
  description?: string;
  status?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  status?: string;
  completionRate: number;
}

export interface SchoolStat {
  id: string;
  name: string;
  status?: string;
  completionRate: number;
  lastUpdate?: string;
  pendingForms?: number;
  formsCompleted?: number;
  totalForms?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface DashboardFormStats {
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  dueSoon: number;
  overdue: number;
  incomplete?: number;
  total: number;
}

export interface SuperAdminDashboardData {
  activeUsers: number;
  totalRegions: number;
  totalSectors: number;
  totalSchools: number;
  completionRate: number;
  pendingEntries: number;
  approvedEntries: number;
  rejectedEntries: number;
  categories: CategoryItem[];
  schools: SchoolStat[];
  regions?: RegionItem[];
}

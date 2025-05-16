
export interface SchoolStat {
  id: string;
  name: string;
  status?: string;
  completion?: number;
  completionRate?: number; // Keep for backward compatibility
  lastUpdate?: string;
  pendingForms?: number;
  pendingEntries?: number;
  pendingCount?: number; // For backward compatibility
  formsCompleted?: number;
  totalForms?: number;
  totalEntries?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface SectorStat {
  id: string;
  name: string;
  region_id?: string;
  regionName?: string;
  status?: string;
  completion?: number;
  completionRate?: number; // Keep for backward compatibility
  totalSchools?: number;
  completedSchools?: number;
  pendingSchools?: number;
  lastUpdate?: string;
}

export interface RegionStat {
  id: string;
  name: string;
  status?: string;
  completion?: number;
  completionRate: number; // Required for compatibility with existing code
  totalSectors?: number;
  totalSchools?: number;
  completedSchools?: number;
  pendingSchools?: number;
  lastUpdate?: string;
}

export interface DeadlineItem {
  id: string;
  title?: string;
  name?: string; // For backward compatibility
  categoryId?: string;
  category?: { id: string; name: string };
  deadline: string;
  daysLeft: number;
  status?: string;
}

export interface FormItem {
  id: string;
  name?: string;
  title?: string;
  categoryId?: string;
  category?: { id: string; name: string };
  status: string;
  submittedAt?: string;
  deadline?: string;
}

export interface FormTabsProps {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  navigateToDataEntry?: () => void;
  handleFormClick?: (id: string) => void;
}

export interface CategoryItem {
  id: string;
  name: string;
  deadline?: string;
  completionRate?: number;
  status?: string;
  count?: number;
  columnCount?: number;
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
  completed: number;
  percentage: number;
}

export interface SchoolAdminDashboardData {
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
  completion?: number | { percentage: number; completed: number; total: number };
  completionRate?: number; // For backward compatibility
  categories?: CategoryItem[];
  upcoming?: DeadlineItem[];
  pendingForms?: FormItem[];
  notifications?: any[];
}

export interface StatusCardsProps {
  completion?: number | { percentage: number; completed: number; total: number };
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
}

export interface SectorAdminDashboardData {
  schools?: any[];
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
}

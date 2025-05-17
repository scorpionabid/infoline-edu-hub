
// Basic dashboard statistics
export interface DashboardStatus {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  total: number;
  active?: number;
  inactive?: number;
}

// Form statistics
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

// Category in dashboard context
export interface CategoryItem {
  id: string;
  name: string;
  completionRate: number;
  completion?: number;
  description?: string;
  deadline?: string;
  status: string;
  daysLeft?: number;
  columnCount?: number;
}

// School in dashboard context
export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  completion?: number;
  status?: string;
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

// Sector in dashboard context
export interface SectorStat {
  id: string;
  name: string;
  completionRate?: number;
  completion?: number;
  schoolCount: number;
  pendingCount?: number;
  status?: string;
}

// Region in dashboard context
export interface RegionStat {
  id: string;
  name: string;
  completionRate?: number; 
  completion?: number;
  sectorCount: number;
  schoolCount: number;
  status?: string;
}

// Pending approval
export interface PendingApproval {
  id: string;
  title?: string;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  submittedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  // Legacy properties
  name?: string;
  school?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  submittedBy?: {
    id: string;
    name: string;
  };
}

// Form item
export interface FormItem {
  id: string;
  title?: string;
  name?: string;
  categoryId?: string;
  categoryName?: string;
  category?: {
    id: string;
    name: string;
  };
  dueDate?: string;
  deadline?: string;
  status: string;
  progress?: number;
}

// Deadline item
export interface DeadlineItem {
  id: string;
  name?: string;
  title?: string;
  categoryId?: string;
  categoryName?: string;
  deadline?: string;
  daysLeft?: number;
  status?: string;
}

// School Admin Dashboard Data
export interface SchoolAdminDashboardData {
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number;
  completionRate?: number;
  status?: DashboardStatus;
  categories?: CategoryItem[];
  formStats?: DashboardFormStats;
  pendingForms?: FormItem[];
  upcoming?: DeadlineItem[];
  notifications?: any[];
}

// Sector Admin Dashboard Data
export interface SectorAdminDashboardData {
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number;
  completionRate?: number;
  status?: DashboardStatus;
  categories?: CategoryItem[];
  formStats?: DashboardFormStats;
  schoolStats?: SchoolStat[];
  pendingApprovals?: PendingApproval[];
  pendingForms?: FormItem[];
  upcoming?: DeadlineItem[];
  schools?: {
    total: number;
    active: number;
    inactive: number;
  };
}

// Region Admin Dashboard Data
export interface RegionAdminDashboardData {
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number;
  completionRate?: number;
  status?: DashboardStatus;
  categories?: CategoryItem[];
  formStats?: DashboardFormStats;
  sectorStats?: SectorStat[];
  schoolStats?: SchoolStat[];
  pendingApprovals?: PendingApproval[];
}

// Super Admin Dashboard Data
export interface SuperAdminDashboardData {
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number;
  completionRate?: number;
  users?: {
    total: number;
    active: number;
    inactive: number;
  };
  regionCount?: number;
  sectorCount?: number;
  schoolCount?: number;
  entryCount?: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    draft: number;
  };
  categoryData?: CategoryItem[];
  schoolData?: SchoolStat[];
  regionData?: RegionStat[];
}

// Status cards props
export interface StatusCardsProps {
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number;
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
}

// Form tabs props
export interface FormTabsProps {
  pendingForms: FormItem[];
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  navigateToDataEntry?: () => void;
  handleFormClick?: (id: string) => void;
}

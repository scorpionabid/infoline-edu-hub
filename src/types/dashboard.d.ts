
// Base types
export interface CompletionData {
  percentage: number;
  total: number;
  completed: number;
}

export interface DashboardStatus {
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  total: number;
  active: number;
  inactive: number;
}

export interface DashboardFormStats {
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  dueSoon: number;
  overdue: number;
  total: number;
}

// For convenience in the code to replace FormStats
export type FormStats = DashboardFormStats;

// Dashboard item types
export interface PendingApproval {
  id: string;
  schoolId?: string;
  schoolName: string;
  categoryId?: string;
  categoryName: string;
  submittedAt: string;
  date?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  completionRate: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  completionRate: number; // Making this required to match CategoryItem
  columns?: any[];
  status?: string;
  assignment?: string;
}

// For backward compatibility
export type DashboardCategory = Category;
export type CategoryWithCompletion = CategoryItem;

export interface DeadlineItem {
  id: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  dueDate: string;
  status: "upcoming" | "overdue" | "completed" | "pending" | "draft";
  completionRate: number;
}

export interface FormItem {
  id: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  status: string;
  completionRate: number;
  submittedAt?: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  lastUpdate: string;
  status?: string;
  pendingForms: number;
  formsCompleted: number;
  totalForms: number;
  principalName: string;
  address?: string;
  phone?: string;
  email?: string;
}

// Alias for SchoolStat
export type SchoolCompletionItem = SchoolStat;
// Alias for sector stats
export type SectorCompletionItem = Sector & { completionRate: number };
// Alias for CompletionData
export type CompletionStats = CompletionData;

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

// Dashboard types by role
export interface SuperAdminDashboardData {
  completion?: CompletionData;
  status?: DashboardStatus;
  notifications?: DashboardNotification[];
  regionStats?: any[];
  sectorStats?: any[];
  schoolStats?: any[];
  formStats?: DashboardFormStats;
  upcomingDeadlines?: DeadlineItem[];
  categories?: CategoryItem[];
}

export interface RegionAdminDashboardData {
  completion?: CompletionData;
  status?: DashboardStatus;
  notifications?: DashboardNotification[];
  sectors?: any[];
  schoolStats?: SchoolStat[];
  formStats?: DashboardFormStats;
  upcomingDeadlines?: DeadlineItem[];
}

export interface SectorAdminDashboardData {
  completion?: CompletionData;
  status?: DashboardStatus;
  notifications?: DashboardNotification[];
  schoolStats?: SchoolStat[];
  formStats?: DashboardFormStats;
  pendingApprovals?: PendingApproval[];
  upcomingDeadlines?: DeadlineItem[];
}

export interface SchoolAdminDashboardData {
  completion?: CompletionData;
  completionRate?: number;
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
  notifications?: DashboardNotification[];
  categories?: CategoryItem[];
  upcoming?: DeadlineItem[];
  pendingForms?: FormItem[];
  upcomingDeadlines?: DeadlineItem[];
}

// Component props types
export interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

export interface RegionAdminDashboardProps {
  data: RegionAdminDashboardData;
  regionId?: string;
}

export interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
  sectorId?: string;
}

export interface SchoolAdminDashboardProps {
  data?: SchoolAdminDashboardData;
  isLoading?: boolean;
  error?: any;
  onRefresh?: () => void;
  navigateToDataEntry?: () => void;
  handleFormClick?: (id: string) => void;
  schoolId?: string;
}

export interface SchoolStatsCardProps {
  stats: SchoolStat[];
}

export interface FormTabsProps {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  navigateToDataEntry?: () => void;
  handleFormClick?: (id: string) => void;
}

export interface PendingApprovalsTableProps {
  pendingApprovals: PendingApproval[];
  limit?: number;
  showViewAllButton?: boolean;
  onRefresh?: () => void;
}

// For charts and data visualization
export interface ChartData {
  activityData?: { name: string; value: number }[];
  regionSchoolsData?: { name: string; value: number }[];
  categoryCompletionData?: { name: string; completed: number }[];
}

export interface CategoryStat {
  id: string;
  name: string;
  completionRate: number;
  completion?: CompletionData;
}

// Stats type for backward compatibility
export type DashboardStats = {
  schools: {
    total: number;
    active: number;
    inactive: number;
  };
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    draft?: number;
    total: number;
  };
  categories: {
    total: number;
    active: number;
    upcoming: number;
    expired: number;
  };
  users: {
    total: number;
    active: number;
    pending: number;
  };
  regions: {
    total: number;
    completed: number;
    inProgress: number;
  };
  sectors: {
    total: number;
    completed: number;
    inProgress: number;
  };
};

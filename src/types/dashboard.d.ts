
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
  deadline: string;
  completionRate: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  deadline: string;
  completionRate: number;
}

export interface DeadlineItem {
  id: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  dueDate: string;
  status: "upcoming" | "overdue" | "completed";
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
  lastUpdate?: string;
  status?: string;
  pendingForms?: number;
  formsCompleted?: number;
  totalForms?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

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
}

export interface RegionAdminDashboardData {
  completion?: CompletionData;
  status?: DashboardStatus;
  notifications?: DashboardNotification[];
  sectors?: any[];
  schoolStats?: SchoolStat[];
  formStats?: DashboardFormStats;
}

export interface SectorAdminDashboardData {
  completion?: CompletionData;
  status?: DashboardStatus;
  notifications?: DashboardNotification[];
  schoolStats?: SchoolStat[];
  formStats?: DashboardFormStats;
  pendingApprovals?: PendingApproval[];
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
}

// Component props types
export interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

export interface RegionAdminDashboardProps {
  data: RegionAdminDashboardData;
  regionId: string;
}

export interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
  sectorId: string;
}

export interface SchoolAdminDashboardProps {
  isLoading: boolean;
  error: any;
  onRefresh?: () => void;
  navigateToDataEntry: () => void;
  handleFormClick: (id: string) => void;
  schoolId: string;
}

export interface SchoolStatsCardProps {
  schools: SchoolStat[];
}

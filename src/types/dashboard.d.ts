
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export type CategoryAssignment = 'all' | 'sectors' | 'schools';
export type CategoryStatus = 'active' | 'inactive' | 'archived' | 'draft' | 'approved' | 'pending' | 'completed';

export interface TabDefinition {
  id: string;
  label: string;
  status?: CategoryStatus | 'all';
  count?: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  deadline?: string | Date | null;
  completionRate: number;
  status: string;
}

export interface DeadlineItem {
  id: string;
  name: string;
  status: string;
  dueDate: string;
  progress: number;
  categoryName?: string;
}

export interface FormItem {
  id: string;
  name: string;
  status: string;
  date?: string;
  categoryName?: string;
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
  incomplete?: number;
  total: number;
}

export interface SchoolStat {
  id: string;
  name: string;
  status: string;
  completionRate: number;
  lastUpdate: string;
  pendingForms: number;
  formsCompleted?: number;
  totalForms?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface PendingApproval {
  id: string;
  schoolId?: string;
  schoolName: string;
  categoryId?: string;
  categoryName: string;
  submittedAt: string;
  date?: string;
  status: string;
}

export interface DashboardCompletion {
  percentage: number;
  total: number;
  completed: number;
}

export interface SchoolAdminDashboardData {
  completion: DashboardCompletion;
  status: DashboardStatus;
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  formStats: DashboardFormStats;
  pendingForms: FormItem[];
  completionRate: number;
  notifications: any[];
}

export interface SectorAdminDashboardData {
  completion: DashboardCompletion;
  status: DashboardStatus;
  formStats?: DashboardFormStats;
  schoolStats: SchoolStat[];
  pendingApprovals: PendingApproval[];
}

export interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
}

export interface RegionAdminDashboardData {
  completion: DashboardCompletion;
  status: DashboardStatus;
  sectorStats: any[];
  pendingApprovals: PendingApproval[];
}

export interface SuperAdminDashboardData {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
}

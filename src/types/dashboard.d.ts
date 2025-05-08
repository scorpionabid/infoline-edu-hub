
import { AppNotification, DashboardNotification } from './notification';
import { School } from './school';

export interface DashboardStatus {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  total: number;
  active: number;
  inactive: number;
}

export interface DashboardFormStats {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  total: number;
  dueSoon: number;
  overdue: number;
}

export interface CompletionData {
  percentage: number;
  total: number;
  completed: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  columns?: Column[];
  status?: string;
  deadline?: string;
}

export interface DeadlineItem {
  id: string;
  category: string;
  categoryId: string;
  categoryName: string;
  dueDate: string;
  status: string;
  completionRate: number;
}

export interface FormItem {
  id: string;
  category: string;
  categoryId: string;
  categoryName: string;
  status: string;
  completionRate: number;
  submittedAt?: string;
}

export interface PendingApproval {
  id: string;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  status: string;
  submittedAt: string;
  date?: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  status: string;
  completionRate: number;
  lastUpdate: string;
  pendingForms: number;
  formsCompleted: number;
  totalForms: number;
}

export interface SuperAdminDashboardData {
  completion: CompletionData;
  status: DashboardStatus;
  schoolStats: School[];
  formStats: DashboardFormStats;
  regionStats?: any[];
  sectorStats?: any[];
  upcomingDeadlines?: DeadlineItem[];
  notifications: DashboardNotification[];
}

export interface RegionAdminDashboardData {
  completion: CompletionData;
  status: DashboardStatus;
  sectors: any[];
  schoolStats: School[];
  formStats: DashboardFormStats;
  upcomingDeadlines?: DeadlineItem[];
  notifications: DashboardNotification[];
}

export interface SectorAdminDashboardData {
  completion: CompletionData;
  status: DashboardStatus;
  schoolStats: any[];
  formStats: DashboardFormStats;
  pendingApprovals: PendingApproval[];
  notifications: DashboardNotification[];
}

export interface SchoolAdminDashboardData {
  completion: CompletionData;
  status: DashboardStatus;
  categories: Category[];
  upcoming: DeadlineItem[];
  formStats: DashboardFormStats;
  pendingForms: FormItem[];
  completionRate: number;
  notifications: DashboardNotification[];
}

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
  schoolId?: string;
  data?: SchoolAdminDashboardData;
}

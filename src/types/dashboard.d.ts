
import { School, SchoolStat } from './school';

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

export interface DashboardCompletion {
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
  dueSoon?: number;
  overdue?: number;
  draft?: number;
  incomplete?: number;
  total: number;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
  priority?: 'low' | 'medium' | 'high';
}

export interface DashboardCategory {
  id: string;
  name: string;
  description?: string;
  submissionCount: number;
  completionPercentage: number;
  deadline?: string;
  status: string;
}

export interface CategoryWithCompletion {
  id: string;
  name: string;
  completionRate: number;
  formsCompleted: number;
  totalForms: number;
}

export interface SchoolCompletionItem {
  id: string;
  name: string;
  completionRate: number;
}

export interface SectorCompletionItem {
  id: string;
  name: string;
  completionRate: number;
}

export interface PendingForm {
  id: string;
  categoryName: string;
  deadline?: string;
  status: string;
}

export interface UpcomingDeadline {
  id: string;
  categoryName: string;
  deadline: string;
  status: string;
}

export interface SchoolAdminDashboardData {
  completion: DashboardCompletion;
  status: DashboardStatus;
  formStats?: DashboardFormStats;
  forms?: DashboardFormStats;
  categories: DashboardCategory[];
  upcoming: UpcomingDeadline[];
  pendingForms: PendingForm[];
  completionRate: number;
  notifications: DashboardNotification[];
}

export interface SchoolAdminDashboardProps {
  data?: SchoolAdminDashboardData;
  isLoading?: boolean;
  error?: Error | string | any;
  onRefresh?: () => void;
  navigateToDataEntry?: () => void;
  handleFormClick?: (formId: string) => void;
  schoolId?: string;
}

export interface SectorAdminDashboardData {
  completion: DashboardCompletion;
  status: DashboardStatus;
  schoolStats: SchoolStat[];
  pendingApprovals: PendingApproval[];
  formStats?: DashboardFormStats;
}

export interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
}

export interface RegionAdminDashboardData {
  completion: DashboardCompletion;
  status: DashboardStatus;
  sectorStats: SectorCompletionItem[];
  bestSchools: SchoolStat[];
  worstSchools: SchoolStat[];
  pendingApprovals: PendingApproval[];
  formStats?: DashboardFormStats;
}

export interface RegionAdminDashboardProps {
  data: RegionAdminDashboardData;
}

export interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

export interface SuperAdminDashboardData {
  completion: DashboardCompletion;
  status: DashboardStatus;
  regions: number;
  sectors: number;
  schools: number;
  notifications: DashboardNotification[];
  formStats?: DashboardFormStats;
}

export interface StatusCardsProps {
  completion?: DashboardCompletion;
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
}

export interface DashboardStats {
  total: number;
  active: number;
  inactive: number;
}

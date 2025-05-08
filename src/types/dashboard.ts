
// Əgər bu fayl mövcud deyilsə, onu yaradaq
import { AppNotification, DashboardNotification } from './notification';

export interface CompletionData {
  percentage: number;
  total: number;
  completed: number;
}

export interface DashboardStatus {
  total: number;
  active: number;
  inactive: number;
  pending?: number;
  approved?: number;
  rejected?: number;
  draft?: number;
}

export interface DashboardFormStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  dueSoon: number;
  overdue: number;
  draft?: number; // draft field əlavə etdik
  incomplete?: number;
}

export interface SchoolAdminDashboardData {
  completion: CompletionData;
  status: DashboardStatus;
  categories: CategoryData[];
  upcoming: DeadlineItem[];
  notifications: DashboardNotification[];
  completionRate: number;
  pendingForms: FormItem[];
  formStats?: DashboardFormStats;
}

export interface SuperAdminDashboardData {
  completion?: CompletionData;
  status?: DashboardStatus;
  regions?: number;
  sectors?: number;
  schools?: number;
  notifications?: DashboardNotification[];
  formStats?: DashboardFormStats;
  stats?: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
  };
  formsByStatus?: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  completionRate?: number;
}

export interface RegionAdminDashboardData {
  completion: CompletionData;
  status: DashboardStatus;
  sectors: SectorData[];
  schoolStats?: SchoolStats[];
  notifications?: DashboardNotification[];
  formStats?: DashboardFormStats;
  categories?: CategoryData[];
  pendingApprovals?: PendingApproval[];
}

export interface SectorAdminDashboardData {
  completion: CompletionData;
  status: DashboardStatus;
  schoolStats: SchoolStats[];
  pendingApprovals: PendingApproval[];
  notifications?: DashboardNotification[];
  formStats?: DashboardFormStats;
}

export interface SectorData {
  id: string;
  name: string;
  schoolCount: number;
  completionRate: number;
}

export interface SchoolStats {
  id: string;
  name: string;
  completionRate: number;
  status: string;
  lastUpdate?: string;
}

// SchoolStat tipi əlavə edirik (SchoolStats ilə eyni)
export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  status: string;
  lastUpdate?: string;
  pendingForms?: number;
  formsCompleted?: number;
  totalForms?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface CategoryData {
  id: string;
  name: string;
  completionRate: number;
  deadline?: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  columnCount?: number;
}

export interface DeadlineItem {
  id: string;
  categoryId: string;
  category: string;
  categoryName?: string;
  deadline: string;
  status: 'upcoming' | 'due' | 'overdue';
  daysRemaining: number;
  title?: string; // title field əlavə etdik
  completionRate?: number; // completionRate field əlavə etdik
}

export interface FormItem {
  id: string;
  categoryId: string;
  category: string;
  categoryName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  submittedAt?: string;
  updatedAt?: string;
  title?: string; // title field əlavə etdik
  deadline?: string; // deadline field əlavə etdik
}

export interface PendingApproval {
  id: string;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  date?: string; // date field əlavə etdik
}

export interface FormStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
}

export interface CompletionStats {
  percentage: number;
  total: number;
  completed: number;
}

// CategoryItem əlavə edək
export interface CategoryItem {
  id: string;
  name: string;
  deadline?: string;
  status: string;
  completionRate: number;
}

// StatusCardsProps interfeysini əlavə edək
export interface StatusCardsProps {
  completion?: CompletionData;
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
}

// Props interfeysləri
export interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

export interface RegionAdminDashboardProps {
  data: RegionAdminDashboardData;
  regionId?: string;
}

export interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
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

// DashboardStats interfeysi əlavə edək
export interface DashboardStats {
  total: number;
  active: number;
  inactive: number;
  users?: number;
  regions?: number;
  sectors?: number;
  schools?: number;
}

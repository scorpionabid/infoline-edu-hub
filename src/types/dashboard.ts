
import { NotificationType, DashboardNotification } from "./notification";

export interface DashboardSummary {
  totalForms: number;
  completedForms: number;
  pendingForms: number;
  overdueForms: number;
  completionRate: number;
}

export interface ActivityItem {
  id: string;
  type: 'form_submitted' | 'form_approved' | 'form_rejected' | 'comment_added';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
  entityId?: string;
}

// Dashboard-specific notification interface
export type { NotificationType, DashboardNotification };

export interface RegionStats {
  id: string;
  name: string;
  totalSchools: number;
  schoolCount?: number;
  sectorCount?: number;
  completionRate: number;
  sectors?: number;
  total?: number;
  active?: number;
}

export interface SectorStats {
  id: string;
  name: string;
  regionId: string;
  regionName: string;
  totalSchools: number;
  completionRate: number;
  total?: number;
  active?: number;
}

export interface SchoolStats {
  id: string;
  name: string;
  sectorId: string;
  sectorName: string;
  regionId?: string;
  regionName?: string;
  completedForms?: number;
  totalForms?: number;
  completionRate: number;
  total?: number;
  active?: number;
  incomplete?: number;
}

export interface RecentForm extends FormItem {
  schoolName?: string;
  sectorName?: string;
  regionName?: string;
  title?: string;
}

export interface DashboardData {
  summary?: DashboardSummary;
  recentActivity?: ActivityItem[];
  notifications?: any[];
  approvalRate?: number;
  completionRate?: number;
  formsByStatus?: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  stats?: any;
}

export interface SuperAdminDashboardData extends DashboardData {
  regions?: RegionStats[];
  totalSchools?: number;
  totalUsers?: number;
  completionRate?: number;
  formsByStatus?: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
}

export interface RegionAdminDashboardData extends DashboardData {
  sectors?: SectorStats[];
  totalSchools?: number;
  sectorStats?: {
    total: number;
    active: number;
  };
  schoolStats?: {
    total: number;
    active: number;
    incomplete: number;
  };
  completionRate?: number;
}

export interface SectorAdminDashboardData extends DashboardData {
  schools?: SchoolStats[];
  schoolsStats?: SchoolStat[];
  completionRate?: number;
}

export interface SchoolAdminDashboardData extends DashboardData {
  upcomingDeadlines?: FormItem[];
  recentForms?: FormItem[];
  formStats?: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
    incomplete?: number;
    drafts?: number;
    dueSoon?: number;
    overdue?: number;
  };
  completionRate?: number;
}

// PendingApproval item interfeysi
export interface PendingApprovalItem {
  id: string;
  formId?: string;
  categoryId?: string;
  schoolId?: string;
  categoryName?: string;
  schoolName?: string;
  status?: 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  submittedBy?: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  sectorId: string;
  sectorName?: string;
  completionRate: number;
  total?: number;
  active?: number;
  incomplete?: number;
  completion?: { total: number; completed: number; percentage: number };
}

export interface FormItem {
  id: string;
  title?: string;
  categoryId?: string;
  status?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  progress?: number;
  [key: string]: any;
}

export interface ChartData {
  activityData?: { name: string; value: number }[];
  regionSchoolsData?: { name: string; value: number }[];
  categoryCompletionData?: { name: string; completed: number }[];
  [key: string]: any;
}

export interface CategoryStat {
  id: string;
  name: string;
  completionRate: number;
  completion?: { total: number; completed: number; percentage: number };
}

// UI notification interface - NotificationType-dən istifadə edirik
export interface UINotification extends NotificationType {
  isRead?: boolean;
  date?: string;
}


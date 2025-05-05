
import { Notification } from "./notification";

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

// Dashboard-specific notification - extended from base Notification
export type { Notification };

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
  regionId: string;
  regionName: string;
  completedForms: number;
  totalForms: number;
  completionRate: number;
  total?: number;
  active?: number;
  incomplete?: number;
}

export interface FormItem {
  id: string;
  title?: string;
  categoryId?: string;
  status?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
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
  notifications?: Notification[];
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
  stats: {
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
  notifications?: Notification[];
}

export interface RegionAdminDashboardData extends DashboardData {
  sectors?: SectorStats[];
  totalSchools?: number;
  stats?: {
    sectors: number;
    schools: number;
    users: number;
  };
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
  notifications?: Notification[];
}

export interface SectorAdminDashboardData extends DashboardData {
  schools?: SchoolStats[];
  statistics: {
    totalSchools: number;
    activeSchools: number;
    pendingSubmissions: number;
    completedSubmissions: number;
  };
  schoolsStats?: SchoolStat[];
  completionRate?: number;
}

export interface SchoolAdminDashboardData extends DashboardData {
  upcomingDeadlines?: RecentForm[];
  recentForms?: RecentForm[];
  formStats?: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    drafts: number;
    incomplete: number;
    dueSoon: number;
    overdue: number;
  };
  completionRate?: number;
}

// Maintain backwards compatibility
export type DashboardNotification = Notification;

// UI notification interface
export type UINotification = Notification;

export interface PendingApprovalItem {
  id: string;
  formId: string;
  categoryId: string;
  schoolId: string;
  categoryName?: string;
  schoolName?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  submittedBy: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  region?: string;
  sectorId?: string;
  sectorName?: string;
  completionRate?: number;
  formStatus?: 'completed' | 'in_progress' | 'pending' | 'overdue';
  lastUpdate?: string;
  completion?: number;
  total?: number;
  active?: number;
  incomplete?: number;
  address?: string;
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


import { FormItem } from "./form";
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

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'deadline' | 'approval' | 'rejection' | 'comment' | 'system';
  read: boolean;
  isRead?: boolean;
  createdAt: string;
  timestamp?: string;
  date?: string;
  time?: string;
}

export interface RegionStats {
  id: string;
  name: string;
  totalSchools: number;
  schoolCount?: number;
  sectorCount?: number;
  completionRate: number;
  sectors?: number;
}

export interface SectorStats {
  id: string;
  name: string;
  regionId: string;
  regionName: string;
  totalSchools: number;
  completionRate: number;
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
}

export interface RecentForm extends FormItem {
  schoolName?: string;
  sectorName?: string;
  regionName?: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  recentActivity: ActivityItem[];
  notifications: DashboardNotification[];
  approvalRate?: number;
  completionRate?: number;
}

export interface SuperAdminDashboardData extends DashboardData {
  regions: RegionStats[];
  totalSchools: number;
  totalUsers: number;
  stats?: any;
  completionRate?: number;
  regionCount?: number;
  sectorCount?: number;
  schoolCount?: number;
  userCount?: number;
  formsByStatus?: any;
  pendingApprovals?: any[];
}

export interface RegionAdminDashboardData extends DashboardData {
  sectors: SectorStats[];
  totalSchools: number;
  stats?: any;
  sectorStats?: {
    total: number;
    active: number;
  };
  schoolStats?: {
    total: number;
    active: number;
    incomplete: number;
  };
  pendingItems?: any[];
  categories?: any[];
  completionRate?: number;
}

export interface SectorAdminDashboardData extends DashboardData {
  schools: SchoolStats[];
  stats?: any;
  schoolsStats?: any[];
  pendingItems?: any[];
  categories?: any[];
  schoolStats?: any;
  completionRate?: number;
}

export interface SchoolAdminDashboardData extends DashboardData {
  upcomingDeadlines: FormItem[];
  recentForms: FormItem[];
  formStats?: any;
  completionRate?: number;
  categories?: any[];
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  };
  status?: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  upcoming?: any[];
  forms?: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    total: number;
  };
  pendingForms?: any[];
}

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
  sectorId: string;
  sectorName: string;
  completionRate: number;
  total?: number;
  active?: number;
  incomplete?: number;
}

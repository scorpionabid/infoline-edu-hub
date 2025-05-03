
import { FormItem } from "./form";

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

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
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
}

export interface SuperAdminDashboardData extends DashboardData {
  regions: RegionStats[];
  totalSchools: number;
  totalUsers: number;
}

export interface RegionAdminDashboardData extends DashboardData {
  sectors: SectorStats[];
  totalSchools: number;
}

export interface SectorAdminDashboardData extends DashboardData {
  schools: SchoolStats[];
}

export interface SchoolAdminDashboardData extends DashboardData {
  upcomingDeadlines: FormItem[];
  recentForms: FormItem[];
}

export interface DashboardNotification {
  id: string;
  message: string;
  createdAt: string;
  type: 'deadline' | 'approval' | 'rejection' | 'comment' | 'system';
  read: boolean;
  link?: string;
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
}

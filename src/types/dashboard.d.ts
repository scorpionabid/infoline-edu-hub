
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

// Birləşdirilmiş Notification interfeysi - bütün bildiriş sahələrini əhatə edir
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'deadline' | 'approval' | 'rejection' | 'comment' | 'system';
  isRead: boolean;
  read?: boolean; // Geriyə uyğunluq üçün
  createdAt: string;
  date?: string; // UI rahatılığı üçün
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
  title?: string; // FormItem interfeysinə title əlavə et
}

export interface DashboardData {
  summary: DashboardSummary;
  recentActivity: ActivityItem[];
  notifications: Notification[];
  approvalRate?: number;
  completionRate?: number;
}

export interface SuperAdminDashboardData extends DashboardData {
  regions: RegionStats[];
  totalSchools: number;
  totalUsers: number;
  stats?: any;
  formsByStatus?: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
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
}

export interface SectorAdminDashboardData extends DashboardData {
  schools: SchoolStats[];
  stats?: any;
  schoolsStats?: SchoolStat[];
}

export interface SchoolAdminDashboardData extends DashboardData {
  upcomingDeadlines: RecentForm[];
  recentForms: RecentForm[];
  formStats?: any;
  completionRate?: number;
}

// Dashboard bildiriş interfeysi artıq əsas Notification tipinə əsaslanır
export interface DashboardNotification extends Notification {}

// UI bildiriş interfeysi də əsas Notification tipinə əsaslanır
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
  sectorId: string;
  sectorName?: string;
  completionRate: number;
  total?: number;
}


// Bu fayl standart interfeyslər üçündür
import { FormItem } from "./form";

// Dashboardda istifadə edilən notification tipi
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  isRead?: boolean;
  read?: boolean;
}

// UI-da istifadə olunan notification
export interface UINotification extends Notification {
  createdAt: string;
}

// Dashboard bildirişi
export interface DashboardNotification extends UINotification {
  createdAt: string;
}

// Dashboard özət məlumatı
export interface DashboardSummary {
  totalSchools?: number;
  completedForms?: number;
  pendingForms?: number;
  approvalRate?: number;
}

// Fəaliyyət sətiri
export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  date: string;
  user?: string;
}

// Region statistikası
export interface RegionStats {
  id: string;
  name: string;
  totalSchools: number;
  completionRate: number;
}

// Sektor statistikası
export interface SectorStats {
  id: string;
  name: string;
  regionName?: string;
  totalSchools: number;
  completionRate: number;
}

// Məktəb statistikası
export interface SchoolStats {
  id: string;
  name: string;
  sectorName?: string;
  regionName?: string;
  completionRate: number;
}

// Son form
export interface RecentForm {
  id: string;
  name: string;
  status: string;
  date: string;
}

// Təsdiq gözləyən element
export interface PendingApprovalItem {
  id: string;
  categoryName: string;
  schoolName: string;
  submittedAt: string;
  status: string;
}

// Məktəb statistikası
export interface SchoolStat {
  id: string;
  name: string;
  value: number;
  change?: number;
}

// Qrafik məlumatları
export interface ChartData {
  labels: string[];
  datasets: any[];
}

// Kateqoriya statistikası
export interface CategoryStat {
  id: string;
  name: string;
  completionRate: number;
  pendingCount: number;
  approvedCount: number;
}

// Dashboard məlumatı
export interface DashboardData {
  summary: DashboardSummary;
  recentActivity?: ActivityItem[];
  notifications?: Notification[];
  pendingApprovals?: PendingApprovalItem[];
  recentForms?: RecentForm[];
  stats?: any;
  chartData?: ChartData;
  approvalRate?: number;
}

// SuperAdmin Dashboard məlumatı
export interface SuperAdminDashboardData extends DashboardData {
  regionStats?: RegionStats[];
  categoryStats?: CategoryStat[];
}

// RegionAdmin Dashboard məlumatı
export interface RegionAdminDashboardData extends DashboardData {
  sectorStats?: SectorStats[];
  categoryStats?: CategoryStat[];
}

// SectorAdmin Dashboard məlumatı
export interface SectorAdminDashboardData extends DashboardData {
  schoolStats?: SchoolStats[];
  categoryStats?: CategoryStat[];
}

// SchoolAdmin Dashboard məlumatı
export interface SchoolAdminDashboardData extends DashboardData {
  formStats?: FormItem[];
  categoryCompletionStats?: CategoryStat[];
}

// Bütün dashboard tiplərini bu fayldan ixrac edirik
export type {
  DashboardSummary,
  ActivityItem,
  RegionStats,
  SectorStats,
  SchoolStats,
  RecentForm,
  DashboardData,
  SuperAdminDashboardData,
  RegionAdminDashboardData,
  SectorAdminDashboardData,
  SchoolAdminDashboardData,
  DashboardNotification,
  UINotification,
  PendingApprovalItem,
  SchoolStat,
  ChartData,
  CategoryStat,
  Notification
};

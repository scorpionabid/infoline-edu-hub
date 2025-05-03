import { DataEntryStatus } from './dataEntry';

export type DashboardRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

export interface DashboardData {
  stats?: {
    regions?: number;
    sectors?: number;
    schools?: number;
    users?: number;
  };
  completionRate: number;
  approvalRate?: number;
  notifications?: DashboardNotification[];
  pendingApprovals?: PendingApprovalItem[];
  completionTrend?: CompletionTrendItem[];
  categories?: CategoryStatusItem[];
  userCount?: number;
  
  // DashboardContent.tsx faylında istifadə edilən xüsusiyyətlər üçün
  regions?: number;
  sectors?: number;
  schools?: number;
  users?: number;
  activeSectors?: number;
  activeSchools?: number;
  incompleteSchools?: number;
  totalForms?: number;
  approvedForms?: number;
  pendingForms?: number;
  rejectedForms?: number;
  incompleteForms?: number;
  draftForms?: number;
}

export interface SuperAdminDashboardData extends DashboardData {
  regions: Array<any>;
  sectors: Array<any>;
  formsByStatus: FormStatusDistribution;
}

export interface RegionAdminDashboardData extends DashboardData {
  sectorStats: SectorStats[];
  schoolStats: SchoolStat[];
  forms: FormItem[];
  formsByStatus: FormStatusDistribution;
}

export interface SectorAdminDashboardData extends DashboardData {
  schools: SchoolItem[];
  schoolStats: {
    total: number;
    active: number;
    incomplete: number;
  };
  forms: FormItem[];
  formsByStatus: FormStatusDistribution;
}

export interface SchoolAdminDashboardData extends DashboardData {
  forms: FormItem[];
  formsByStatus: FormStatusDistribution;
  categories: CategoryStatusItem[];
}

export interface SchoolItem {
  id: string;
  name: string;
  completionRate: number;
  status: 'active' | 'inactive';
  formsCount: number;
  type: string;
}

export interface SchoolStat {
  total: number;
  active: number;
  incomplete: number;
}

export interface SectorStats {
  id: string;
  name: string;
  schoolCount: number;
  completionRate: number;
}

export interface RegionStats {
  id: string;
  name: string;
  sectorCount: number;
  schoolCount: number;
  completionRate: number;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  timestamp?: string;
  type: "error" | "info" | "warning" | "success" | "deadline" | "approval" | "rejection" | "comment" | "system";
  read: boolean;
  isRead?: boolean;
}

export interface PendingApprovalItem {
  id: string;
  category: string;
  categoryName?: string;
  school: string;
  schoolName?: string;
  submittedAt?: string;
  status: string;
  userId: string;
}

export interface CompletionTrendItem {
  date: string;
  rate: number;
}

export interface CategoryStatusItem {
  id: string;
  name: string;
  formCount: number;
  completionRate: number;
}

export interface FormStatusDistribution {
  draft: number;
  submitted: number;
  approved: number;
  rejected: number;
  total: number;
}

export type FormStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'incomplete';

export interface FormItem {
  id: string;
  categoryId: string;
  categoryName: string;
  status: FormStatus;
  completionRate: number;
  lastUpdated: string;
  submittedAt?: string;
  deadline?: string;
  date?: string;
}

export interface CompletionRateCardProps {
  completionRate: number;
  title: string;
}

export interface NotificationsCardProps {
  notifications: DashboardNotification[];
  onMarkAsRead?: (id: string) => void;
  onViewAll?: () => void;
  limit?: number;
}

export interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

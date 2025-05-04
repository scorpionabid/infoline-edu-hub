
import { ColumnType } from "./supabase";

// UI bildiriş tipi ilə DashboardNotification tipi arasında uyğunsuzluq var
// Bunu düzəltmək üçün ortaq tip yaradırıq
export interface BaseNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

export interface DashboardNotification extends BaseNotification {
  timestamp?: string;
  type: "system" | "deadline" | "approval" | "rejection" | "comment";
  read?: boolean;
  createdAt?: string;
}

export interface UINotification extends BaseNotification {
  type: "error" | "info" | "warning" | "success";
}

export interface BasicStats {
  regions?: number;
  sectors?: number;
  schools?: number;
  users?: number;
}

export interface SectorStat {
  total: number;
  incomplete?: number;
  active?: number;
}

export interface SchoolStat {
  total: number;
  incomplete?: number;
  active?: number;
}

export interface FormStatus {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  incomplete?: number;
  drafts?: number;
  dueSoon?: number;
  overdue?: number;
}

export interface CompletionStats {
  percentage: number;
  total: number;
  completed: number;
}

export interface FormItem {
  id: string;
  title: string;
  status: "pending" | "approved" | "rejected" | "draft" | "incomplete";
  dueDate?: string;
  progress: number;
  category?: string;
}

export interface DashboardData {
  regions?: number;
  sectors?: number;
  schools?: number;
  users?: number;
  activeSectors?: number;
  activeSchools?: number;
  incompleteSchools?: number;
  pendingForms?: number;
  approvedForms?: number;
  rejectedForms?: number;
  totalForms?: number;
  incompleteForms?: number;
  draftForms?: number;
  completionRate?: number;
  approvalRate?: number;
  categories?: CategorySummary[];
}

export interface CategorySummary {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  status: string;
  completion: number;
  hasPendingItems?: boolean;
}

export interface SuperAdminDashboardData {
  stats: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
  };
  regions?: any[];
  pendingApprovals?: any[];
  regionCount?: number;
  sectorCount?: number;
  schoolCount?: number;
  userCount?: number;
  formsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  notifications: UINotification[];
  approvalRate?: number;
  completionRate?: number;
}

export interface RegionAdminDashboardData {
  stats: {
    sectors: number;
    schools: number;
    users: number;
  };
  pendingItems?: any[];
  categories?: any[];
  sectors?: any[];
  notifications: UINotification[];
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

export interface SectorAdminDashboardData {
  stats: {
    schools: number;
    users: number;
  };
  pendingItems?: any[];
  schools?: any[];
  categories?: any[];
  schoolsStats?: SchoolStat[];
  notifications: UINotification[];
  completionRate?: number;
}

export interface SchoolAdminDashboardData {
  formStats: FormStatus;
  categories?: CategorySummary[];
  notifications: UINotification[];
  completionRate: number;
}

export interface SchoolAdminDashboardProps {
  data: SchoolAdminDashboardData;
  isLoading?: boolean;
  error?: any;
  onRefresh?: () => void;
  navigateToDataEntry?: () => void;
  handleFormClick?: (formId: string) => void;
}

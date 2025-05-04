
import { ColumnType } from "./supabase";

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  timestamp: string;
  type: "system" | "deadline" | "approval" | "rejection" | "comment";
  isRead: boolean;
  read: boolean;
}

export interface UINotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: "error" | "info" | "warning" | "success";
  isRead: boolean;
}

export interface BasicStats {
  regions?: number;
  sectors?: number;
  schools?: number;
  users?: number;
}

export interface SchoolStat {
  total: number;
  incomplete: number;
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
  regions: any[];
  pendingApprovals: any[];
  regionCount: number;
  sectorCount: number;
  schoolCount: number;
  userCount: number;
  formsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  notifications: UINotification[];
  approvalRate: number;
}

export interface RegionAdminDashboardData {
  stats: {
    sectors: number;
    schools: number;
    users: number;
  };
  pendingItems: any[];
  categories: any[];
  sectors: any[];
  notifications: UINotification[];
  sectorStats: {
    total: number;
    active: number;
  };
  schoolStats: {
    total: number;
    active: number;
    incomplete: number;
  };
  completionRate: number;
}

export interface SectorAdminDashboardData {
  stats: {
    schools: number;
    users: number;
  };
  pendingItems: any[];
  schools: any[];
  categories: any[];
  schoolsStats: SchoolStat[];
  notifications: UINotification[];
  completionRate: number;
}

export interface SchoolAdminDashboardData {
  formStats: FormStatus;
  categories?: CategorySummary[];
  notifications: UINotification[];
  completionRate: number;
}

export interface SchoolAdminDashboardProps {
  data: SchoolAdminDashboardData;
  isLoading: boolean;
  error: any;
  onRefresh: () => void;
  navigateToDataEntry: () => void;
  handleFormClick: (formId: string) => void;
}

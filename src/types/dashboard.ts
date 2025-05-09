
import { MouseEventHandler } from "react";

export interface DashboardData {
  status: DashboardStatus;
  completion: DashboardCompletion;
}

export interface DashboardStatus {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  total: number;
  active: number;
  inactive: number;
}

export interface DashboardCompletion {
  total: number;
  completed: number;
  percentage: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  completionRate: number;
  status?: string;
}

export interface DeadlineItem {
  id: string;
  categoryId?: string;
  title?: string;
  name?: string;
  deadline?: string;
  daysLeft?: number;
  daysRemaining?: number;
}

export interface FormItem {
  id: string;
  title?: string;
  name?: string;
  categoryName?: string;
  categoryId?: string;
  status?: string;
}

export interface FormTabsProps {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  navigateToDataEntry?: () => void;
  handleFormClick?: (id: string) => void;
}

export interface SchoolAdminDashboardData {
  status: DashboardStatus;
  completion: DashboardCompletion;
  completionRate?: number;
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  formStats?: DashboardFormStats;
  notifications?: any[];
}

export interface SectorAdminDashboardData {
  status: DashboardStatus;
  completion: DashboardCompletion;
  completionRate?: number;
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  formStats?: DashboardFormStats;
  notifications?: any[];
  pendingApprovals?: PendingApproval[];
  schoolStats?: SchoolStat[];
}

export interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
}

export interface SuperAdminDashboardProps {
  data: any;
  regions?: any[];
  sectors?: any[];
}

export interface DashboardFormStats {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  dueSoon: number;
  overdue: number;
  total: number;
}

export interface SchoolStat {
  id: string;
  name: string;
  status?: string;
  completionRate: number;
  lastUpdate?: string;
  pendingForms?: number;
  formsCompleted?: number;
  totalForms?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface SectorStat {
  id: string;
  name: string;
  status?: string;
  completionRate?: number;
  schoolCount?: number;
  region?: string;
  regionId?: string;
  description?: string;
}

export interface PendingApproval {
  id: string;
  schoolId?: string;
  schoolName?: string;
  categoryId?: string;
  categoryName?: string;
  formName?: string;
  status?: string;
  createdAt?: string;
  columnName?: string;
  value?: string;
}

export interface StatusCardsProps {
  status: DashboardStatus;
  completion: DashboardCompletion;
  formStats?: DashboardFormStats;
}

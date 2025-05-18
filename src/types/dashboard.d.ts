
// Dashboard Types
export interface DashboardStatus {
  pendingForms: number;
  completedForms: number;
  approvedForms: number;
  rejectedForms: number;
}

export interface DashboardFormStats {
  total: number;
  completed: number;
  pending: number;
  approved: number;
  rejected: number;
  completionRate: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  deadline?: string;
  daysLeft?: number;
  status: string;
  totalForms: number;
  completedForms: number;
  completionRate: number;
}

export interface FormItem {
  id: string;
  name: string;
  deadline?: string;
  status: string;
  daysLeft?: number;
  completedFields: number;
  totalFields: number;
  completionRate: number;
}

export interface DeadlineItem {
  id: string;
  name: string;
  deadline: string;
  daysLeft: number;
  completionRate: number;
}

export interface PendingApproval {
  id: string;
  schoolName: string;
  formName: string;
  submittedBy: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface SchoolAdminDashboardData {
  categories: CategoryItem[];
  forms: FormItem[];
  deadlines: DeadlineItem[];
  status: DashboardStatus;
  stats: DashboardFormStats;
}

export interface SectorAdminDashboardData {
  stats: DashboardFormStats;
  schoolStats: SchoolStat[];
  categoryStats: CategoryStat[];
  pendingApprovals: PendingApproval[];
}

export interface RegionAdminDashboardData {
  stats: DashboardFormStats;
  sectorStats: SectorStat[];
  schoolStats: SchoolStat[];
  pendingApprovals: PendingApproval[];
}

export interface SuperAdminDashboardData {
  stats: DashboardFormStats;
  regionStats: RegionStat[];
  categories: CategoryItem[];
  pendingApprovals: PendingApproval[];
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  pendingApprovals: number;
  totalForms: number;
}

export interface SectorStat {
  id: string;
  name: string;
  completionRate: number;
  schoolCount: number;
}

export interface RegionStat {
  id: string;
  name: string;
  completionRate: number;
  sectorCount: number;
  schoolCount: number;
}

export interface StatusCardsProps {
  pendingForms: number;
  completedForms: number;
  approvedForms: number;
  rejectedForms: number;
}

export interface FormTabsProps {
  categories: CategoryItem[];
  deadlines: DeadlineItem[];
  forms: FormItem[];
}

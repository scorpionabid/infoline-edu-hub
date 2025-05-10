
export interface DashboardStatus {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  active: number;
  inactive: number;
  draft?: number;
}

export interface DashboardCompletion {
  total: number;
  completed: number;
  percentage: number;
}

export interface DashboardFormStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  dueSoon: number;
  overdue: number;
  draft: number;
}

export interface SuperAdminDashboardData {
  status: DashboardStatus;
  completion: DashboardCompletion;
  regionStats: Array<any>;
  pendingApprovals: Array<any>;
  totalRegions?: number;
  totalSectors?: number;
  totalSchools?: number;
}

export interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

export interface RegionAdminDashboardData {
  status: DashboardStatus;
  completion: DashboardCompletion;
  sectorStats: Array<SectorStat>;
  pendingApprovals: Array<PendingApproval>;
}

export interface SectorAdminDashboardData {
  status: DashboardStatus;
  completion: DashboardCompletion;
  schoolStats: Array<SchoolStat>;
  pendingApprovals: Array<PendingApproval>;
  categories: Array<CategoryItem>;
  upcoming: Array<DeadlineItem>;
  pendingForms: Array<FormItem>;
  formStats?: DashboardFormStats;
}

export interface SchoolAdminDashboardData {
  status: DashboardStatus;
  completion: DashboardCompletion;
  categories: Array<CategoryItem>;
  upcoming: Array<DeadlineItem>;
  pendingForms: Array<FormItem>;
  formStats?: DashboardFormStats;
  completionRate?: number;
  notifications?: Array<any>;
}

export interface PendingApproval {
  id: string;
  title?: string;
  schoolName: string;
  status: 'pending' | 'approved' | 'rejected';
  categoryName?: string;
  submittedBy?: string;
  submittedAt?: string;
  dueDate?: string;
  createdAt?: string;
  schoolId?: string;
  categoryId?: string;
  count?: number;
}

export interface StatusCardsProps {
  status: DashboardStatus;
  completion: DashboardCompletion;
  formStats?: DashboardFormStats;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  status?: string;
  pendingForms?: number;
  formsCompleted?: number;
  totalForms?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
  lastUpdate?: string;
}

export interface SectorStat {
  id: string;
  name: string;
  schoolCount?: number;
  completion?: number;
  status?: string;
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
  title: string;
  deadline: string;
  daysLeft?: number;
  categoryId?: string;
}

export interface FormItem {
  id: string;
  title: string;
  categoryName?: string;
  status: string;
  category?: string;
  dueDate?: string;
  completionRate?: number;
}

export interface FormTabsProps {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  navigateToDataEntry?: () => void;
  handleFormClick?: (id: string) => void;
}

export interface DashboardStatus {
  total: number;
  active: number;
  inactive: number;
}

export interface DashboardFormStats {
  totalForms: number;
  pendingForms: number;
  approvedForms: number;
  rejectedForms: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'approved' | 'pending' | 'rejected';
  completion?: number;
}

export interface FormItem {
  id: string;
  name: string;
  status: string;
}

export interface DeadlineItem {
  id: string;
  name: string;
  dueDate: string;
  deadline?: string;
  status: string;
}

export interface PendingApproval {
  id: string;
  schoolName: string;
  sectorName?: string;
  regionName?: string;
  categoryName: string;
  date: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
}

export interface SectorStat {
  id: string;
  name: string;
  schoolCount: number;
  completionRate: number;
}

export interface SuperAdminDashboardData {
  users: {
    active: number;
    total: number;
  };
  regionCount: number;
  sectorCount: number;
  schoolCount: number;
  categories: CategoryItem[];
  pendingApprovals: PendingApproval[];
  deadlines: DeadlineItem[];
  regionStats: Array<{
    id: string;
    name: string;
    schoolCount: number;
    completionRate: number;
  }>;
}

export interface SchoolAdminDashboardData {
  categories: CategoryItem[];
  deadlines: DeadlineItem[];
  forms: FormItem[];
}

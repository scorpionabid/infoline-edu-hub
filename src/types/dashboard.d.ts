
export interface DashboardFormStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  dueSoon: number;
  overdue: number;
  completed: number;
  percentage: number;
  completion_rate: number;
  approvedForms?: number;
  pendingForms?: number;
  rejectedForms?: number;
}

export interface PendingApproval {
  id: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
  schoolName?: string;
  categoryName?: string;
  submittedAt?: string;
  date?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  completion_rate?: number;
  completionRate?: number;
  status?: string;
  description?: string;
  deadline?: string;
}

export interface FormItem {
  id: string;
  name?: string;
  title?: string;
  status?: string;
  category_id?: string;
  category?: string;
  categoryName?: string;
  dueDate?: string;
}

export interface DeadlineItem {
  id: string;
  name?: string;
  title?: string;
  deadline: string;
  status?: string;
  daysLeft?: number;
  category?: string;
  categoryId?: string;
  categoryName?: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  completion_rate?: number;
  totalEntries?: number;
  total_entries?: number;
  pendingEntries?: number;
  pending_entries?: number;
  pendingCount?: number;
  pendingForms?: number;
  approved_entries?: number;
  status?: 'active' | 'inactive';
  region_id?: string;
  sector_id?: string;
  formsCompleted?: number;
  totalForms?: number;
  lastUpdate?: string;
}

export interface SectorStat {
  id: string;
  name: string;
  completionRate: number;
  completion_rate?: number;
  completion?: number;
  schoolCount?: number;
  totalSchools?: number;
  total_schools?: number;
  completedSchools?: number;
  pendingSchools?: number;
}

export interface RegionAdminDashboardData {
  status?: {
    total: number;
    active: number;
    inactive: number;
    pending?: number;
    approved?: number;
    rejected?: number;
    draft?: number;
  };
  formStats?: DashboardFormStats;
  completion?: {
    percentage: number;
    total?: number;
    completed?: number;
  } | number;
  completionRate?: number;
  sectorStats?: SectorStat[];
  pendingApprovals?: PendingApproval[];
  categories?: CategoryItem[];
  upcomingDeadlines?: DeadlineItem[];
  schoolStats?: SchoolStat[];
  upcoming?: DeadlineItem[];
  pendingForms?: FormItem[];
  notifications?: any[];
}

export interface SectorAdminDashboardData extends RegionAdminDashboardData {
  schoolStats?: SchoolStat[];
  schools?: {
    total: number;
    active: number;
    inactive: number;
  };
  users?: {
    total: number;
    admins: number;
    teachers: number;
  };
  entryCount?: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
}

export interface SchoolAdminDashboardData extends RegionAdminDashboardData {
  categories?: CategoryItem[];
  formItems?: FormItem[];
  notifications?: any[];
  upcoming?: DeadlineItem[];
  pendingForms?: FormItem[];
}

export interface SuperAdminDashboardData extends RegionAdminDashboardData {
  regionStats?: any[];
  systemStats?: any;
  users?: {
    active: number;
    total: number;
    new: number;
  };
  regionCount?: number;
  sectorCount?: number;
  schoolCount?: number;
  userCount?: number;
  entryCount?: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    draft: number;
  };
  approvalRate?: number;
  categoryData?: any[];
  schoolData?: any[];
  regionData?: any[];
  regions?: any[];
  formsByStatus?: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
}

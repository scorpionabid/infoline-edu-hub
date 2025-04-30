
export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  type?: string;
  isRead?: boolean;
}

export interface FormItem {
  id: string;
  title: string;
  category?: string;
  date?: string;
  status: string;
  completionPercentage: number;
}

export interface CategoryStat {
  id: string;
  name: string;
  completionRate: number;
  completion: {
    total: number;
    completed: number;
    percentage: number;
  };
}

export interface ChartData {
  activityData?: Array<{ name: string, value: number }>;
  regionSchoolsData?: Array<{ name: string, value: number }>;
  categoryCompletionData?: Array<{ name: string, completed: number }>;
}

export interface SuperAdminDashboardData {
  stats?: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
    completion_rate?: number;
    total_entries?: number;
    approved_entries?: number;
    pending_entries?: number;
    rejected_entries?: number;
    approval_rate?: number;
  };
  formsByStatus?: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  completionRate?: number;
  pendingApprovals?: Array<{
    id: string;
    title: string;
    date: string;
    status: string;
    school: string;
  }>;
  regions?: Array<{
    id: string;
    name: string;
    sectorCount: number;
    schoolCount: number;
    completionRate: number;
  }>;
  notifications?: DashboardNotification[];
  categories?: CategoryStat[];
}

export interface RegionAdminDashboardData {
  region?: {
    id: string;
    name: string;
    status: string;
  };
  sectors?: {
    total: number;
    active: number;
  };
  schools?: {
    total: number;
    active: number;
  };
  stats?: {
    completion_rate: number;
    total_entries: number;
    pending_count: number;
    pending_schools: number;
  };
  sectorStats?: Array<{
    id: string;
    name: string;
    school_count: number;
    completion_rate: number;
  }>;
  notifications?: DashboardNotification[];
}

export interface SectorAdminDashboardData {
  sector?: {
    id: string;
    name: string;
    status: string;
  };
  region?: {
    id: string;
    name: string;
  };
  schools?: {
    total: number;
    active: number;
  };
  stats?: {
    completion_rate: number;
    total_entries: number;
    pending_count: number;
    pending_schools: number;
  };
  schoolStats?: Array<{
    id: string;
    name: string;
    completion_rate: number;
    pending_count: number;
  }>;
  notifications?: DashboardNotification[];
}

export interface SchoolAdminDashboardData {
  completion: {
    total: number;
    completed: number;
    percentage: number;
  };
  status: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  categories: CategoryStat[];
  upcoming: Array<{
    id: string;
    title: string;
    dueDate: string;
    remainingDays: number;
  }>;
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    total: number;
  };
  pendingForms: FormItem[];
  completionRate: number;
  notifications: DashboardNotification[];
}

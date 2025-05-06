
export interface FormItem {
  id: string;
  title: string;
  status: string;
  categoryName?: string;
  dueDate?: string;
  createdAt?: string;
  completionRate?: number;
}

export interface FormDeadline extends FormItem {
  // FormDeadline artıq FormItem'in xüsusiyyətlərinə sahib olacaq
}

export interface SchoolStats {
  id: string;
  name: string;
  completionRate?: number;
  formsCompleted?: number;
  formsTotal?: number;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate?: number;
  formsCompleted?: number;
  formsTotal?: number;
}

export interface SchoolAdminDashboardData {
  formStats?: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
    total: number;
    incomplete: number;
    dueSoon: number;
    overdue: number;
  };
  recentForms?: FormItem[];
  upcomingDeadlines?: FormItem[];
  completionRate?: number;
  notifications?: any[];
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  };
  status?: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  categories?: any[];
  upcoming?: any[];
  forms?: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    total: number;
  };
  pendingForms?: any[];
}

export interface SuperAdminDashboardData {
  stats: {
    totalUsers: number;
    totalSchools: number;
    totalRegions: number;
    totalSectors: number;
  };
  formsByStatus: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
    submitted: number;
  };
  completionRate: number;
  notifications: DashboardNotification[];
}

export interface RegionAdminDashboardData {
  stats: {
    sectors: number;
    schools: number;
    users: number;
    totalSchools: number;
    totalSectors: number;
    totalForms: number;
    totalCategories: number;
  };
  sectorStats: any[];
  schoolStats: any[];
  completionRate: number;
  notifications: DashboardNotification[];
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: string;
}

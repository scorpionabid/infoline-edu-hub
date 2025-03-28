
// Dashboard vəziyyəti formatları

export interface FormItem {
  id: string;
  title: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft' | 'overdue' | 'due';
  deadline?: string;
  completionPercentage: number;
}

export interface DashboardData {
  totalSchools?: number;
  activeSchools?: number;
  pendingForms: FormItem[];
  upcomingDeadlines: Array<{
    category: string;
    date: string;
  }>;
  regionalStats?: Array<{
    region: string;
    approved: number;
    pending: number;
    rejected: number;
  }>;
  sectorStats?: Array<{
    sector: string;
    approved: number;
    pending: number;
    rejected: number;
  }>;
  notifications?: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    time: string;
  }>;
}

export interface SuperAdminDashboardData extends DashboardData {
  totalUsers?: number;
  activeUsers?: number;
  totalCategories?: number;
  totalSectors?: number;
  totalRegions?: number;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    time: string;
  }>;
  regionCompletionData?: Array<{
    region: string;
    completion: number;
  }>;
  sectorCompletionData?: Array<{
    sector: string;
    completion: number;
  }>;
  categoryCompletionData?: Array<{
    category: string;
    completion: number;
  }>;
}

export interface RegionAdminDashboardData extends DashboardData {
  regionName?: string;
  totalSectors?: number;
  totalSchools?: number;
  completionRate?: number;
  categories?: number;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    time: string;
  }>;
  sectorCompletions?: Array<{
    sector: string;
    completion: number;
  }>;
}

export interface SectorAdminDashboardData extends DashboardData {
  sectorName?: string;
  regionName?: string;
  totalSchools?: number;
  completionRate?: number;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    time: string;
  }>;
  schoolCompletions?: Array<{
    school: string;
    completion: number;
  }>;
}

export interface SchoolAdminDashboardData extends DashboardData {
  schoolName?: string;
  sectorName?: string;
  regionName?: string;
  completionRate?: number;
  forms?: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
  };
  totalForms?: number;
  completedForms?: number;
  pendingForms: FormItem[];
  rejectedForms?: number;
  dueDates?: Array<{
    category: string;
    date: string;
  }>;
  recentForms?: Array<{
    id: string;
    title: string;
    category: string;
    status: 'pending' | 'approved' | 'rejected' | 'draft' | 'overdue' | 'due' | 'empty';
    completionPercentage: number;
    deadline?: string;
  }>;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    time: string;
  }>;
}

export interface ChartData {
  activityData: Array<{
    name: string;
    value: number;
  }>;
  regionSchoolsData: Array<{
    name: string;
    value: number;
  }>;
  categoryCompletionData: Array<{
    name: string;
    completed: number;
  }>;
}

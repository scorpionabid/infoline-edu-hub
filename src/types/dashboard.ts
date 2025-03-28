
// Dashboard vəziyyəti formatları

export interface FormItem {
  id: string;
  title: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft' | 'overdue' | 'due' | 'empty';
  deadline?: string;
  completionPercentage: number;
}

export type FormStatus = 'pending' | 'approved' | 'rejected' | 'draft' | 'overdue' | 'due' | 'empty' | 'dueSoon';

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
}

export interface CompletionDataItem {
  name: string;
  completed: number;
}

export interface RegionCompletionItem {
  name: string;      // Burada region yerinə name
  completed: number; // Burada completion yerinə completed
}

export interface SectorCompletionItem {
  name: string;      // Burada sector yerinə name
  completed: number; // Burada completion yerinə completed
}

export interface CategoryCompletionItem {
  name: string;      // Burada category yerinə name
  completed: number; // Burada completion yerinə completed
}

export interface SuperAdminDashboardData extends DashboardData {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
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
  regionCompletionData?: RegionCompletionItem[];
  sectorCompletionData?: SectorCompletionItem[];
  categoryCompletionData?: CategoryCompletionItem[];
  pendingSchools?: number;
  approvedSchools?: number;
  rejectedSchools?: number;
  activityData?: Array<{
    id: string;
    action: string;
    actor: string;
    target: string;
    time: string;
  }>;
  statusData?: {
    completed: number;
    pending: number;
    rejected: number;
    notStarted: number;
  };
}

export interface RegionAdminDashboardData extends DashboardData {
  regionName: string;  // optional deyil, required edildi
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  totalSectors?: number;
  totalSchools?: number;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    time: string;
  }>;
  categories?: Array<{
    name: string;
    completionRate: number;
    color: string;
  }>;
  sectorCompletions?: Array<{
    name: string;
    completionRate: number;
  }>;
}

export interface SectorAdminDashboardData extends DashboardData {
  sectorName: string;  // optional deyil, required edildi
  regionName: string;  // optional deyil, required edildi
  schools: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  totalSchools?: number;
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
  schoolName: string;  // optional deyil, required edildi
  sectorName: string;  // optional deyil, required edildi
  regionName: string;  // optional deyil, required edildi
  completionRate: number;
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
  };
  totalForms?: number;
  completedForms?: number;
  rejectedForms?: number;
  dueDates?: Array<{
    category: string;
    date: string;
  }>;
  recentForms?: Array<FormItem>;
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

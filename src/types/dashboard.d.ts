
export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  completion: number;
  completionRate?: number; // Geriyə uyğunluq üçün əlavə edildi
  totalFields: number;
  completedFields: number;
  lastUpdated?: string;
  deadline?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface FormItem {
  id: string;
  title: string;
  name?: string; // Geriyə uyğunluq üçün əlavə edildi
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  lastModified: string;
  deadline?: string;
  assignedTo?: string;
  progress: number;
  category: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  name?: string; // Geriyə uyğunluq üçün əlavə edildi
  deadline: string;
  status: 'upcoming' | 'overdue' | 'completed';
  priority: 'high' | 'medium' | 'low';
  daysLeft: number;
}

export interface PendingApproval {
  id: string;
  schoolName: string;
  categoryName: string;
  date: string;
  submittedAt?: string;
  created_at?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  completion_rate?: number; // Geriyə uyğunluq üçün
  totalForms: number;
  completedForms: number;
  pendingForms: number;
  totalEntries?: number;
  total_entries?: number;
  pendingEntries?: number;
  pending_entries?: number;
  pendingCount?: number;
  formsCompleted?: number;
  status: 'active' | 'inactive';
  lastUpdated: string;
  lastUpdate?: string; // Geriyə uyğunluq üçün
}

export interface SectorStat {
  id: string;
  name: string;
  schoolCount: number;
  completionRate: number;
  completion_rate?: number; // Geriyə uyğunluq üçün
  completion?: number; // Geriyə uyğunluq üçün
  totalSchools: number;
  total_schools?: number; // Geriyə uyğunluq üçün
  activeSchools: number;
  status: 'active' | 'inactive';
}

export interface DashboardFormStats {
  total: number;
  completed: number;
  pending: number;
  rejected: number;
  approved?: number; // Geriyə uyğunluq üçün əlavə edildi
  approvedForms?: number; // Geriyə uyğunluq üçün əlavə edildi
  pendingForms?: number; // Geriyə uyğunluq üçün əlavə edildi
  rejectedForms?: number; // Geriyə uyğunluq üçün əlavə edildi
  completionRate: number;
  // Əlavə sahələr dashboard komponentləri üçün
  draft?: number;
  dueSoon?: number;
  overdue?: number;
  percentage?: number;
  completion_rate?: number;
  active?: number;
  inactive?: number;
}

export interface SuperAdminDashboardData {
  stats: DashboardFormStats;
  recentActivity: any[];
  topPerformingRegions: any[];
  alerts: any[];
  // Əlavə sahələr
  users?: number;
  regionCount?: number;
  sectorCount?: number;
  schoolCount?: number;
  completion?: {
    total: number;
    completed: number;
    percentage: number;
  };
}

export interface RegionAdminDashboardData {
  stats: DashboardFormStats;
  status?: DashboardFormStats; // Geriyə uyğunluq üçün əlavə edildi
  formStats?: DashboardFormStats; // Geriyə uyğunluq üçün əlavə edildi
  completion?: any; // Geriyə uyğunluq üçün əlavə edildi
  completionRate?: number; // Geriyə uyğunluq üçün əlavə edildi
  sectors: SectorStat[];
  sectorStats?: SectorStat[]; // Geriyə uyğunluq üçün əlavə edildi
  schools: SchoolStat[];
  schoolStats?: SchoolStat[]; // Geriyə uyğunluq üçün əlavə edildi
  recentActivity: any[];
  pendingApprovals?: any[]; // Geriyə uyğunluq üçün əlavə edildi
  categories?: any[]; // Geriyə uyğunluq üçün əlavə edildi
  upcomingDeadlines?: any[]; // Geriyə uyğunluq üçün əlavə edildi
}

export interface SectorAdminDashboardData {
  stats: DashboardFormStats;
  status?: DashboardFormStats; // Geriyə uyğunluq üçün əlavə edildi
  formStats?: DashboardFormStats; // Geriyə uyğunluq üçün əlavə edildi
  schools: SchoolStat[];
  schoolStats?: SchoolStat[]; // Geriyə uyğunluq üçün əlavə edildi
  recentActivity: any[];
  alerts: any[];
  // Əlavə sahələr
  completion?: {
    total: number;
    completed: number;
    percentage: number;
  };
  completionRate?: number;
  pendingApprovals?: any[];
  categories?: any[];
  upcoming?: any[];
  pendingForms?: any[];
}

export interface SchoolAdminDashboardData {
  categories: CategoryItem[];
  upcomingDeadlines: DeadlineItem[];
  upcoming?: DeadlineItem[]; // Geriyə uyğunluq üçün əlavə edildi
  pendingForms: FormItem[];
  recentActivity: any[];
  status?: any; // Geriyə uyğunluq üçün əlavə edildi
  formStats?: any; // Geriyə uyğunluq üçün əlavə edildi
  completion?: any; // Geriyə uyğunluq üçün əlavə edildi
  notifications?: any[]; // Geriyə uyğunluq üçün əlavə edildi
  completionRate?: number; // Geriyə uyğunluq üçün əlavə edildi
}

export interface FormTabsProps {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  navigateToDataEntry: () => void;
  handleFormClick: (id: string) => void;
  onCategoryChange: (categoryId: string) => void;
}

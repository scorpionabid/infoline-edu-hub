
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
  totalForms: number;
  completedForms: number;
  pendingForms: number;
  status: 'active' | 'inactive';
  lastUpdated: string;
}

export interface SectorStat {
  id: string;
  name: string;
  schoolCount: number;
  completionRate: number;
  totalSchools: number;
  activeSchools: number;
  status: 'active' | 'inactive';
}

export interface DashboardFormStats {
  total: number;
  completed: number;
  pending: number;
  rejected: number;
  completionRate: number;
}

export interface SuperAdminDashboardData {
  stats: DashboardFormStats;
  recentActivity: any[];
  topPerformingRegions: any[];
  alerts: any[];
}

export interface RegionAdminDashboardData {
  stats: DashboardFormStats;
  sectors: SectorStat[];
  schools: SchoolStat[];
  recentActivity: any[];
}

export interface SectorAdminDashboardData {
  stats: DashboardFormStats;
  schools: SchoolStat[];
  recentActivity: any[];
  alerts: any[];
}

export interface SchoolAdminDashboardData {
  categories: CategoryItem[];
  upcomingDeadlines: DeadlineItem[];
  pendingForms: FormItem[];
  recentActivity: any[];
}

export interface FormTabsProps {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  navigateToDataEntry: () => void;
  handleFormClick: (id: string) => void;
  onCategoryChange: (categoryId: string) => void;
}

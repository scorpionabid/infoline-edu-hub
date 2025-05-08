
export interface Dashboard {
  stats: DashboardStats;
  pendingApprovals: PendingApproval[];
  recentUpdates: RecentUpdate[];
  notifications: DashboardNotification[];
  chartData?: ChartData;
}

export interface DashboardStats {
  forms: FormStats;
  categories: CategoryStats;
  schools: SchoolStats;
  sectors: SectorStats;
}

export interface FormStats {
  total: number;
  completed: number;
  incomplete: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  completionRate: number;
}

export interface SchoolStats {
  total: number;
  active: number;
  inactive: number;
}

export interface SectorStats {
  total: number;
  active: number;
  inactive: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface PendingApproval {
  id: string;
  schoolId?: string;
  schoolName: string;
  categoryId?: string;
  categoryName: string;
  submittedAt: string;
  date?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface RecentUpdate {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'form' | 'category' | 'school' | 'sector' | 'user';
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: string;
}

export interface DashboardStatus {
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  active: number;
  inactive: number;
  total: number;
}

export interface DashboardFormStats {
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  dueSoon: number;
  overdue: number;
  incomplete?: number;
  total: number;
}

export interface CategoryStat {
  id: string;
  name: string;
  status: string;
  completionRate: number;
  updatedAt: string;
}

export type ReportType = 'statistics' | 'completion' | 'comparison' | 'custom' | 'school' | 'category';

export interface Report {
  id: string;
  title: string;
  description: string;
  type: ReportType;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

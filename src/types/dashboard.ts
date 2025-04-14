
import { Column } from './column';
import { Notification } from './notification';

// Statistika elementi
export interface StatsItem {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
}

// Qrafik məlumatları
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

// Dashboard bildirişləri
export interface DashboardNotification extends Omit<Notification, 'date'> {
  date: string;
}

// Form elementi
export interface FormItem {
  id: string;
  title: string;
  category?: string;
  status: string;
  completionPercentage: number;
  date: string;
}

// Həftənin günlərinin fəaliyyət məlumatları
export interface DayActivity {
  day: string;
  completed: number;
  added: number;
}

// SuperAdmin dashboard məlumatları
export interface SuperAdminDashboardData {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  notifications: DashboardNotification[];
  stats: StatsItem[];
  formsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
  regionStats: Array<{
    id: string;
    name: string;
    sectorCount: number;
    schoolCount: number;
    completionRate: number;
  }>;
}

// RegionAdmin dashboard məlumatları
export interface RegionAdminDashboardData {
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  notifications: DashboardNotification[];
  stats: StatsItem[];
  categories: Array<{
    name: string;
    completionRate: number;
    color: string;
    id: string;
  }>;
  sectorCompletions: Array<{
    name: string;
    completionRate: number;
    id: string;
    schoolCount?: number;
  }>;
}

// SectorAdmin dashboard məlumatları
export interface SectorAdminDashboardData {
  schools: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  notifications: DashboardNotification[];
  stats: StatsItem[];
  schoolStats: Array<{
    id: string;
    name: string;
    completionRate: number;
    pending: number;
  }>;
  pendingItems: Array<{
    id: string;
    school: string;
    category: string;
    date: string;
  }>;
  categoryCompletion: Array<{
    name: string;
    completionRate: number;
    color: string;
    id: string;
  }>;
  activityLog: Array<{
    id: string;
    action: string;
    target: string;
    time: string;
  }>;
}

// SchoolAdmin dashboard məlumatları
export interface SchoolAdminDashboardData {
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
    dueSoon: number;
    overdue: number;
  };
  completionRate: number;
  notifications: DashboardNotification[];
  pendingForms: FormItem[];
}

// Ümumi dashboard məlumatları tipi
export type DashboardData = SuperAdminDashboardData | RegionAdminDashboardData | SectorAdminDashboardData | SchoolAdminDashboardData;

// Kateqoriya və sütunları birlikdə saxlayan tip
export interface CategoryWithColumns {
  id: string;
  name: string;
  description: string;
  status: string;
  deadline: string;
  priority: number;
  assignment: string;
  created_at: string;
  updated_at: string;
  columns: Column[];
}


import { Notification } from './notification';

// Entity sayğacları üçün interfeyslər
export interface EntityCount {
  total: number;
  active: number;
  inactive: number;
}

export interface UserEntityCount extends EntityCount {
  byRole: {
    superadmin?: number;
    regionadmin?: number;
    sectoradmin?: number;
    schooladmin?: number;
  };
}

// Statistik məlumat elementi
export interface StatsItem {
  id?: string;
  title: string; 
  value: number | string;
  description?: string;
  increase?: boolean;
  percent?: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

// Ümumi Dashboard Məlumatları Interfeysi
export interface DashboardData {
  completionRate?: number;
  pendingApprovals?: number;
  notifications?: Notification[];
  statistics?: {
    completionRate: number;
    pendingForms: number;
    totalSchools: number;
  };
  // DashboardData-nın sadə versiyasında bunlar number tipindədir
  regions?: number | EntityCount;
  sectors?: number | EntityCount;
  schools?: number | EntityCount;
  users?: number | UserEntityCount;
  // İstatistik elementlər və digər məlumatlar
  stats?: StatsItem[];
  formsByStatus?: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

// Super Admin Dashboard Məlumatları
export interface SuperAdminDashboardData extends Omit<DashboardData, 'regions' | 'sectors' | 'schools' | 'users'> {
  regions: EntityCount;
  sectors: EntityCount;
  schools: EntityCount;
  users: UserEntityCount;
  regionStats?: Array<{
    id: string;
    name: string;
    sectorCount: number;
    schoolCount: number;
    completionRate: number;
  }>;
  formsByStatus?: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

// Region Admin Dashboard Məlumatları
export interface RegionAdminDashboardData extends Omit<DashboardData, 'sectors' | 'schools' | 'users'> {
  regionName?: string;
  sectors: EntityCount;
  schools: EntityCount;
  users: number | UserEntityCount;
  sectorCompletions?: Array<{
    id: string;
    name: string;
    schoolCount: number;
    completionPercentage: number;
  }>;
  pendingSchools?: number;
  approvedSchools?: number;
  rejectedSchools?: number;
}

// Sektor Admin Dashboard Məlumatları
export interface SectorAdminDashboardData extends Omit<DashboardData, 'schools'> {
  sectorName?: string;
  regionName?: string;
  schools: EntityCount;
  schoolStats?: Array<{
    id: string;
    name: string;
    completionRate: number;
    pending: number;
  }>;
  pendingSchools?: number;
  approvedSchools?: number;
  rejectedSchools?: number;
}

// Form statusları
export type FormStatus = 'pending' | 'approved' | 'rejected' | 'dueSoon' | 'due' | 'overdue';

// Form elementi
export interface FormItem {
  id: string;
  title: string;
  date: string;
  status: string;
  category?: string;
  completionPercentage?: number;
  deadline?: string;
}

// Məktəb Admin Dashboard Məlumatları
export interface SchoolAdminDashboardData extends DashboardData {
  schoolName: string;
  sectorName: string;
  regionName: string;
  forms: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
  };
  pendingForms: FormItem[];
  formsByStatus?: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

// Qrafik Məlumatları
export interface ChartData {
  activityData: Array<{name: string; value: number}>;
  regionSchoolsData: Array<{name: string; value: number}>;
  categoryCompletionData: Array<{name: string; completed?: number; value?: number}>;
}

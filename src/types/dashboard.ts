
import { Category } from './category';
import { Region } from './region';
import { School } from './school';
import { Sector } from './sector';
import { User } from './user';

export interface DashboardStats {
  total: number;
  active: number;
  inactive: number;
  pending?: number;
  completed?: number;
  draft?: number;
}

export interface SuperAdminDashboardData {
  statistics: {
    users?: DashboardStats;
    regions?: DashboardStats;
    sectors?: DashboardStats;
    schools?: DashboardStats;
    categories?: DashboardStats;
  };
  latestActivities?: Array<{
    id: string;
    action: string;
    user: User;
    entity: any;
    timestamp: string;
  }>;
}

export interface RegionAdminDashboardData {
  statistics: {
    sectors?: DashboardStats;
    schools?: DashboardStats;
    submissions?: DashboardStats;
  };
  regions: Region[];
  latestActivities?: Array<{
    id: string;
    action: string;
    user: User;
    entity: any;
    timestamp: string;
  }>;
}

export interface SectorAdminDashboardData {
  statistics: {
    totalSchools: number;
    activeSchools: number;
    pendingSubmissions: number;
    completedSubmissions: number;
  };
  sectors: Sector[];
  schools: SchoolStat[];
}

export interface SchoolAdminDashboardData {
  statistics: {
    categories?: DashboardStats;
    submissions?: DashboardStats;
    approvals?: DashboardStats;
  };
  activities: Array<{
    id: string;
    action: string;
    status: string;
    timestamp: string;
    category?: Category;
  }>;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    priority: 'normal' | 'high' | 'critical';
  }>;
}

export interface SchoolStat {
  id: string;
  name: string;
  region: string;
  formStatus: 'completed' | 'in_progress' | 'pending' | 'overdue';
  lastUpdate: string;
  completion: number;
}

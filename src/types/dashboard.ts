
import { CategoryAssignment } from '@/types/category';

export interface DashboardFormStats {
  completedForms: number;
  pendingForms: number;
  approvalRate: number;
  total: number;
  completed: number;
  approved: number;
  pending: number;
  rejected: number;
  draft: number;
  dueSoon: number;
  overdue: number;
  percentage: number;
  completion_rate: number;
  completionRate: number;
}

export interface StatsGridItem {
  title: string;
  value: string | number;
  color: string;
  description: string;
}

export interface SuperAdminDashboardData {
  totalRegions: number;
  totalSectors: number;
  totalSchools: number;
  totalUsers: number;
  categories: Array<{
    id: string;
    name: string;
    status: string;
    completionRate: number;
    assignment: CategoryAssignment;
  }>;
  pendingApprovals: any[];
  deadlines: any[];
  regionStats: any[];
  regions: Array<{
    id: string;
    name: string;
    status: string;
    adminEmail?: string;
    sectorCount: number;
    completionRate: number;
  }>;
  formsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  stats: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
  };
  regionCount: number;
  sectorCount: number;
  schoolCount: number;
  userCount: number;
  approvalRate: number;
  completionRate: number;
  notifications: any[];
}

export interface RegionAdminDashboardData {
  categories: Array<{
    id: string;
    name: string;
    status: string;
    completionRate: number;
    assignment: CategoryAssignment;
  }>;
  deadlines: any[];
  sectors: Array<{
    id: string;
    name: string;
    totalSchools: number;
    activeSchools: number;
    completionRate: number;
    status: string;
    adminEmail?: string;
  }>;
  stats: {
    sectors: number;
    schools: number;
    users: number;
  };
  pendingItems: any[];
  notifications: any[];
  completionRate: number;
  formStats: DashboardFormStats;
}

export interface SectorAdminDashboardData {
  categories: Array<{
    id: string;
    name: string;
    status: string;
    completionRate: number;
    assignment: CategoryAssignment;
  }>;
  deadlines: any[];
  schools: Array<{
    id: string;
    name: string;
    completionRate: number;
    totalForms: number;
    completedForms: number;
    pendingForms: number;
    status: string;
    lastUpdated: string;
    adminEmail?: string;
  }>;
  stats: {
    schools: number;
  };
  pendingItems: any[];
  notifications: any[];
  completionRate: number;
}

export interface SchoolAdminDashboardData {
  categories: Array<{
    id: string;
    name: string;
    status: string;
    completionRate: number;
  }>;
  deadlines: any[];
  stats: {
    completed: number;
    pending: number;
  };
  formStats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    drafts: number;
    incomplete: number;
  };
  notifications: any[];
  completionRate: number;
  status: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
    total: number;
    active: number;
    inactive: number;
  };
  completion: {
    percentage: number;
    completed: number;
    total: number;
  };
  pendingForms: any[];
  upcoming: any[];
}

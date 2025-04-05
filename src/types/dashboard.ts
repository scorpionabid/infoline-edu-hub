
import { Notification } from './notification';

export interface FormItem {
  id: string;
  title: string;
  date: string;
  status: string;
}

export interface AdminDashboardData {
  regions?: number;
  sectors?: number;
  schools?: number;
  users?: number;
  completionRate: number;
  pendingApprovals: number;
  notifications: Notification[];
}

export interface RegionAdminDashboardData {
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  notifications: Notification[];
  categories?: { 
    name: string; 
    completionRate: number; 
    color: string; 
  }[];
  sectorCompletions?: { 
    name: string; 
    completionRate: number; 
  }[];
}

export interface SectorAdminDashboardData {
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  notifications: Notification[];
  categories?: { 
    name: string; 
    completionRate: number; 
    color: string;
  }[];
  schoolsCompletions?: { 
    name: string; 
    completionRate: number; 
  }[];
}

export interface SchoolAdminDashboardData {
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
  };
  completionRate: number;
  notifications: Notification[];
  categories?: number;
  totalForms?: number;
  completedForms?: number;
  pendingForms: FormItem[];
  rejectedForms?: number;
  dueDates?: {
    category: string;
    dueDate: string;
  }[];
  recentForms?: {
    name: string;
    date: string;
    status: string;
  }[];
}

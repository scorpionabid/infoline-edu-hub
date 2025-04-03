
import { Notification } from "./notification";
import { FormItem } from "./form";

// Activity Item tipini təyin edirik
export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  userId: string;
  action?: string;
  actor?: string;
  target?: string;
  time?: string;
}

// Chart data tipləri
export interface ChartData {
  activityData?: any[];
  regionSchoolsData?: any[];
  categoryCompletionData?: any[];
  categoryCompletion: any[];
  statusDistribution: any[];
}

// SuperAdmin Dashboard Data tipi
export interface SuperAdminDashboardData {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  notifications: Notification[];
  activityData: ActivityItem[];
  categoryCompletion: { name: string; completion: number }[];
  statusDistribution: { status: string; count: number }[];
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  dueSoonForms: number;
  overdueForms: number;
  pendingForms: FormItem[];
  completedForms: FormItem[];
  recentForms?: FormItem[];
}

// Region Admin Dashboard Data tipi
export interface RegionAdminDashboardData {
  sectors: number; 
  schools: number;
  users?: number;
  completionRate: number;
  approvalRate: number; 
  pendingApprovals: number;
  notifications: Notification[];
  activityData: ActivityItem[];
  categoryCompletion: { name: string; completion: number }[];
  statusDistribution: { status: string; count: number }[];
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  approvedSectors: number;
  rejectedSectors: number;
  pendingForms: FormItem[];
  completedForms: FormItem[];
  recentForms?: FormItem[];
  regionName?: string;
}

// Sector Admin Dashboard Data tipi
export interface SectorAdminDashboardData {
  schools: number;
  users?: number;
  completionRate: number;
  pendingApprovals: number;
  notifications: Notification[];
  activityData: ActivityItem[];
  categoryCompletion: { name: string; completion: number }[];
  statusDistribution: { status: string; count: number }[];
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  pendingForms: FormItem[];
  completedForms: FormItem[];
  recentForms?: FormItem[];
  sectorName?: string;
  regionName?: string;
}

// School Admin Dashboard Data tipi
export interface SchoolAdminDashboardData {
  schoolName: string;
  sectorName: string;
  regionName: string;
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
  };
  completionRate: number;
  notifications: Notification[];
  activityData: ActivityItem[];
  categoryCompletion: { name: string; completion: number }[];
  statusDistribution: { status: string; count: number }[];
  pendingForms: FormItem[];
  completedForms: FormItem[];
  dueSoonForms: FormItem[];
  overdueForms: FormItem[];
  recentForms?: FormItem[];
  totalForms?: number;
}

// Ümumi Dashboard Data tipi
export type DashboardData = SuperAdminDashboardData | RegionAdminDashboardData | SectorAdminDashboardData | SchoolAdminDashboardData;

// FormStatus tipini re-export edirik
export type { FormStatus } from './form';
export type { FormItem } from './form';

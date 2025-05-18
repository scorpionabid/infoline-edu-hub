
import { Category } from '@/types/category';
import { School } from '@/types/school';
import { Sector } from '@/types/sector';
import { Region } from '@/types/region';
import { UserRole } from '@/types/role';

// Basic interface for approval items
export interface PendingApproval {
  id: string;
  school_name?: string;
  school_id?: string;
  category_name: string;
  category_id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  updated_at?: string;
  submitter_name?: string;
  submitter_id?: string;
}

// Dashboard form statistics
export interface DashboardFormStats {
  total: number;
  completed: number;
  pending: number;
  approved: number;
  rejected: number;
  completion_rate?: number;
  draft?: number;
  dueSoon?: number;
  overdue?: number;
  percentage?: number;
}

// Category list items
export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  completionRate?: number;
  status: 'active' | 'draft' | 'archived' | string;
}

// Form list items
export interface FormItem {
  id: string;
  name: string;
  category_id: string;
  school_id?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | string;
  last_updated?: string;
  deadline?: string;
  completion_percentage?: number;
}

// Deadline items
export interface DeadlineItem {
  id: string;
  category_name: string;
  category_id: string;
  deadline: string;
  days_remaining: number;
  completion_percentage: number;
}

// Status for dashboard components
export interface DashboardStatus {
  total: number;
  completed?: number;
  pending?: number;
  approved?: number;
  rejected?: number;
  draft?: number;
  active?: number;
  inactive?: number;
  completion_percentage?: number;
}

// Props for StatusCards component
export interface StatusCardsProps {
  status: {
    total: number;
    completed: number;
    pending: number;
    approved?: number;
    rejected?: number;
    completion_percentage: number;
  };
}

// Tab definition for form tabs
export interface TabDefinition {
  id: string;
  label: string;
  value: string;
  count?: number;
  title?: string;
  columns?: any[];
}

// Props for form tabs component
export interface FormTabsProps {
  categories: CategoryItem[];
  upcoming?: DeadlineItem[];
  pendingForms?: FormItem[];
  deadlines?: DeadlineItem[];
  forms?: FormItem[];
  onTabChange?: (value: string) => void;
  navigateToDataEntry?: () => void;
  handleFormClick?: (id: string) => void;
}

// Sector statistics
export interface SectorStat {
  id: string;
  name: string;
  completion_rate: number;
  total_schools: number;
  submitted_forms: number;
  total_forms: number;
}

// School Admin Dashboard Data
export interface SchoolAdminDashboardData {
  categories: CategoryItem[];
  forms?: FormItem[];
  deadlines?: DeadlineItem[];
  status: DashboardStatus;
  formStats: DashboardFormStats;
  notifications?: any[];
  upcoming?: DeadlineItem[];
  pendingForms?: FormItem[];
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number;
  completionRate?: number;
}

// Sector Admin Dashboard Data
export interface SectorAdminDashboardData {
  schools?: School[];
  schoolStats?: any[];
  categories: CategoryItem[];
  status: DashboardStatus;
  formStats: DashboardFormStats;
  pendingApprovals?: PendingApproval[];
  upcoming?: DeadlineItem[];
  pendingForms?: FormItem[];
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number;
  completionRate?: number;
}

// Region Admin Dashboard Data
export interface RegionAdminDashboardData {
  sectors: Sector[];
  schools: School[];
  categories: CategoryItem[];
  status: DashboardStatus;
  formStats: DashboardFormStats;
  sectorStats: SectorStat[];
}

// Super Admin Dashboard Data
export interface SuperAdminDashboardData {
  regions?: Region[];
  regionData?: any[];
  sectors?: Sector[];
  schools?: School[];
  schoolData?: any[];
  categories?: CategoryItem[];
  categoryData?: CategoryItem[];
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
  users?: {
    active: number;
    total: number;
  };
  regionCount?: number;
  sectorCount?: number;
  schoolCount?: number;
  entryCount?: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    draft: number;
  };
  completion?: {
    percentage: number;
    total: number;
    completed: number;
  } | number;
  completionRate?: number;
}

// Export SchoolStat from dashboard.ts
export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  status?: string;
  lastUpdate?: string;
  pendingCount?: number;
  pendingEntries?: number;
  totalEntries?: number;
  pendingForms?: number;
  formsCompleted?: number;
  totalForms?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

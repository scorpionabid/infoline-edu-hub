// Dashboard types

export interface DashboardCompletion {
  percentage: number;
  completed: number;
  total: number;
}

export interface CompletionData {
  percentage: number;
  completed: number;
  total: number;
}

export interface DashboardStatus {
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  total: number;
  active: number;
  inactive: number;
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

export interface PendingApproval {
  id: string;
  title?: string;
  school?: string;
  schoolName: string;
  categoryName: string;
  status?: 'pending' | 'approved' | 'rejected';
  date?: string;
  submittedAt: string;
  createdAt?: string;
  timestamp?: string;
  entity?: any;
  schoolId?: string;
  categoryId?: string;
  count?: number;
}

export interface DeadlineItem {
  id: string;
  name?: string;
  title?: string;
  dueDate?: string;
  completionRate?: number;
  progress?: number;
  status?: 'upcoming' | 'overdue' | 'completed' | 'pending' | 'draft';
  category?: string;
  categoryName?: string;
  timestamp?: string;
  deadline?: string;
  categoryId?: string;
}

export interface FormItem {
  id: string;
  name?: string;
  title?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'draft';
  deadline?: string;
  category?: string;
  categoryName?: string;
  dueDate?: string;
  completionRate?: number;
  progress?: number;
  categoryId?: string;
  submittedAt?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  completionRate: number;
  dueDate?: string;
  progress?: number;
  deadline?: string;
  status?: 'active' | 'inactive' | 'archived';
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  columns?: any[];
  status?: string;
  deadline?: string;
  completionRate?: number;
  assignment?: string;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  status?: string;
  completionRate: number;
  lastUpdate: string;
  pendingForms: number;
  formsCompleted: number;
  totalForms: number;
  principalName: string;
  address?: string;
  phone?: string;
  email?: string;
  pendingCount?: number;
}

export interface CategoryStat {
  id: string;
  name: string;
  completionRate: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface RegionStat {
  id: string;
  name: string;
  schoolCount: number;
  sectorCount: number;
  completionRate: number;
  status?: string;
}

export interface SectorStat {
  id: string;
  name: string;
  schoolCount: number;
  completionRate: number;
  region_id?: string;
  status?: string;
}

export interface TabDefinition {
  id: string;
  label: string;
  status?: string | 'all';
  count?: number;
}

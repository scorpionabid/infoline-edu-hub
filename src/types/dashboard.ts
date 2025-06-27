
// Dashboard types - enhanced with missing exports

export interface DashboardStats {
  totalSchools: number;
  completedForms: number;
  pendingApprovals: number;
  overdueForms: number;
}

// Dashboard form statistics interface
export interface DashboardFormStats {
  // Əsas xassələr
  total: number;
  completed: number;
  pending: number;
  rejected: number;
  approved: number;
  completionRate: number;
  
  // Əlavə xassələr
  totalForms: number;
  completedForms: number;
  pendingForms: number;
  pendingApprovals: number;
  rejectedForms: number;
  approvalRate: number;
  draft: number;
  dueSoon: number;
  overdue: number;
  percentage: number;
  completion_rate: number; // completionRate-in alternativ variantı
}

// Enhanced dashboard data for complete information
export interface EnhancedDashboardData {
  totalCategories?: number;
  completedCategories?: number;
  pendingCategories?: number;
  totalColumns?: number;
  filledColumns?: number;
  overallProgress?: number;
  categoryProgress?: CategoryProgress[];
  columnStatuses?: ColumnStatus[];
  totalForms?: number;
  completedForms?: number;
  pendingForms?: number;
  rejectedForms?: number;
  totalSectors?: number;
  totalSchools?: number;
  pendingApprovals?: number;
  completionRate?: number;
  stats?: any;
  formStats?: DashboardFormStats;
}

// Category progress tracking
export interface CategoryProgress {
  id: string;
  name: string;
  progress: number;
  status: string;
  completionRate: number;
}

// Column status tracking
export interface ColumnStatus {
  id: string;
  name: string;
  status: string;
  categoryId: string;
  categoryName: string;
}

// SchoolStat interface - əlavə edildi
export interface SchoolStat {
  id: string;
  name: string;
  completed: number;
  total: number;
  percentage: number;
  status: string;
  completionRate: number;
  pendingForms: number;
  totalForms: number;
  lastUpdated?: string;
}

// StatsGridItem - SuperAdminDashboard üçün
export interface StatsGridItem {
  title: string;
  value: number | string;
  color: string;
  description: string;
  icon: string;
}

// Missing exports that were causing build errors
export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface DashboardCard {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon?: string;
}

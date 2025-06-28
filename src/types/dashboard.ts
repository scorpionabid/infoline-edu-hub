
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

// Enhanced category progress with more details
export interface CategoryProgress {
  id: string;
  name: string;
  progress: number;
  status: 'completed' | 'partial' | 'empty' | 'pending';
  completionRate: number;
  deadline?: string;
  columnCount?: number;
  filledColumnCount?: number;
  lastUpdated?: string;
}

// Enhanced column status with more information
export interface ColumnStatus {
  id: string;
  name: string;
  status: 'completed' | 'pending' | 'rejected' | 'empty';
  categoryId: string;
  categoryName: string;
  type?: string;
  isRequired?: boolean;
  value?: string;
  lastUpdated?: string;
  error?: string;
}

// School specific dashboard data interface
export interface SchoolDashboardData {
  categories: CategoryProgress[];
  columnStatuses: ColumnStatus[];
  totalCategories: number;
  completedCategories: number;
  totalColumns: number;
  filledColumns: number;
  overallProgress: number;
  pendingForms: number;
  approvedForms: number;
  rejectedForms: number;
  recentActivity: RecentActivity[];
  deadlines?: CategoryDeadline[];
}

// Recent activity tracking
export interface RecentActivity {
  id: string;
  type: 'data_entry' | 'approval' | 'rejection' | 'update';
  categoryName: string;
  columnName?: string;
  timestamp: string;
  status: string;
  description: string;
}

// Category deadline information
export interface CategoryDeadline {
  categoryId: string;
  categoryName: string;
  deadline: string;
  daysRemaining: number;
  isOverdue: boolean;
  progress: number;
}

// Statistics card configuration for enhanced display
export interface DashboardStatsConfig {
  id: string;
  title: string;
  value: number | string;
  description: string;
  icon: any; // Lucide icon component
  variant: 'default' | 'success' | 'warning' | 'danger' | 'primary';
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  clickable?: boolean;
  onClick?: () => void;
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

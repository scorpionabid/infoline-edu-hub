
// Dashboard types - enhanced with missing exports

export interface DashboardStats {
  totalEntries: number;
  completedEntries: number;
  pendingEntries: number;
  approvedEntries: number;
  rejectedEntries: number;
  completed: number;
  pending: number;
  pendingFormCount: number;
  // Added missing properties from DashboardHeader usage
  schoolCount: number;
  activeUserCount: number;
  completionPercentage: number;
  totalForms?: number;
  completedForms?: number;
}

// Missing interfaces that were causing build errors
export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  progress: number;
  status: 'completed' | 'partial' | 'empty' | 'pending';
  completionRate: number;
  completion?: number; // Added missing property
  deadline?: string;
  columnCount?: number;
  filledColumnCount?: number;
  lastUpdated?: string;
  totalFields?: number; // Added missing property
  completedFields?: number; // Added missing property
}

export interface PendingApproval {
  id: string;
  categoryId: string;
  categoryName: string;
  schoolId: string;
  schoolName: string;
  columnId: string;
  columnName: string;
  value: string;
  submittedAt: string;
  date?: string; // Added missing property
  submittedBy: string;
  priority: 'low' | 'medium' | 'high';
}

export interface FormItem {
  id: string;
  name: string;
  title?: string; // Added missing property
  status: 'completed' | 'pending' | 'draft';
  progress: number;
  deadline?: string;
  lastUpdated?: string;
  lastModified?: string; // Added missing property
  categoryId: string;
  category?: string; // Added missing property
}

export interface DeadlineItem {
  id: string;
  categoryId: string;
  categoryName: string;
  name?: string; // Added missing property
  title?: string; // Added missing property
  deadline: string;
  daysRemaining: number;
  daysLeft?: number; // Added missing property
  isOverdue: boolean;
  progress: number;
  priority: 'low' | 'medium' | 'high';
  status?: string; // Added missing property
}

export interface SectorStat {
  id: string;
  name: string;
  schoolCount: number;
  totalSchools?: number; // Added missing property
  completionRate: number;
  completion?: number; // Added missing property
  completion_rate?: number; // Added missing property
  pendingApprovals: number;
  totalForms: number;
  completedForms: number;
  lastActivity?: string;
}

export interface FormTabsProps {
  categories: CategoryItem[];
  deadlines: DeadlineItem[];
  forms: FormItem[];
  upcoming?: DeadlineItem[]; // Added missing property
  pendingForms?: FormItem[]; // Added missing property
  onCategorySelect?: (categoryId: string) => void;
  onFormSelect?: (formId: string) => void;
  navigateToDataEntry?: (categoryId: string) => void; // Added missing property
  handleFormClick?: (formId: string) => void; // Added missing property
  onCategoryChange?: (categoryId: string) => void; // Added missing property
}

export interface DashboardChartProps {
  data?: any[];
  stats?: any; // Added missing property
  type?: 'bar' | 'line' | 'pie' | 'doughnut';
  title?: string;
  height?: number;
  showLegend?: boolean;
}

// Sector Admin specific dashboard data
export interface SectorAdminDashboardData {
  totalSchools: number;
  pendingApprovals: number;
  completionRate: number;
  stats: DashboardStats;
  summary?: {
    total: number;
    completed: number;
    pending: number;
    rejected: number;
    approved: number;
    completionRate: number;
    approvalRate: number;
    draft: number;
    dueSoon: number;
    overdue: number;
  };
  schoolsWithStats?: any[];
  totalRequiredColumns?: number;
  totalPossibleEntries?: number;
}

// SuperAdmin dashboard data
export interface SuperAdminDashboardData {
  totalUsers: number;
  totalSchools: number;
  totalCategories: number;
  pendingApprovals: number;
  completionRate: number;
  stats: DashboardStats;
  forms: DashboardFormStats;
  userCount: number;
  totalRegions: number;
  formsByStatus: any;
  approvalRate: number;
  regions: any[];
}

// RegionAdmin dashboard data
export interface RegionAdminDashboardData {
  totalSectors: number;
  totalSchools: number;
  pendingApprovals: number;
  completionRate: number;
  stats: DashboardStats;
  sectors: SectorStat[]; // YENİ - sektor statistikaları
}

// SchoolAdmin dashboard data
export interface SchoolAdminDashboardData {
  totalForms: number;
  completedForms: number;
  pendingForms: number;
  stats: DashboardStats;
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
  sectors?: SectorStat[]; // YENİ - sektor statistikaları
  summary?: {
    total: number;
    completed: number;
    pending: number;
    rejected: number;
    approved: number;
    completionRate: number;
    approvalRate: number;
    draft: number;
    dueSoon: number;
    overdue: number;
  };
  schoolsWithStats?: any[];
  totalRequiredColumns?: number;
  totalPossibleEntries?: number;
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
  // Added missing properties
  totalEntries?: number;
  total_entries?: number;
  pendingEntries?: number;
  pending_entries?: number;
  pendingCount?: number;
  completedForms?: number;
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

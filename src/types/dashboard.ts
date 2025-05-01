// Dashboard notifications
export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  date?: string; // Əlavə edildi
  time?: string; // Əlavə edildi
  isRead?: boolean; // Əlavə edildi
  priority?: string;
  createdAt?: string;
  entity?: string;
  target?: string;
}

// Status items for dashboard
export interface StatsItem {
  title: string;
  count: number;
  description?: string;
  icon?: React.ReactNode;
  label?: string;
  value?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  change?: number;
}

// Pending items for dashboard
export interface PendingItem {
  id: string;
  title: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  schoolName?: string;
  categoryName?: string;
  dueDate?: string;
  submittedAt?: string;
  school?: string;
  category?: string;
  completionPercentage?: number;
  description?: string;
}

// Form item for school admin
export interface FormItem {
  id: string;
  title: string;
  category?: string;
  date: string;
  status: FormStatus | string;
  completionPercentage: number;
  description?: string;
}

// Region stats
export interface RegionStat {
  id: string;
  name: string;
  completion: CompletionStats;
  schoolCount?: number;
  sectorCount?: number;
  completionRate?: number;
}

// Region list item
export interface RegionStats {
  id: string;
  name: string;
  sectorCount: number;
  schoolCount: number;
  adminEmail?: string;
  status?: string;
  completionRate?: number;
}

// Sector completion item
export interface SectorCompletionItem {
  id: string;
  name: string;
  schoolCount: number;
  completionPercentage?: number;
  completionRate?: number;
}

// Category stats
export interface CategoryStat {
  id: string;
  name: string;
  completion: CompletionStats;
  schoolCount?: number;
  completionPercentage?: number;
  deadline?: string;
  columnCount?: number;
  status?: string;
  completionRate?: number;
  schools?: number;
}

// Completion statistics
export interface CompletionStats {
  total: number;
  completed: number;
  percentage: number;
}

// School stat
export interface SchoolStat {
  id: string;
  name: string;
  sector: string;
  sectorId?: string;
  region?: string;
  regionId?: string;
  completion: CompletionStats;
  pendingCount?: number;
  formCount?: number;
  completionRate?: number;
  completionPercentage?: number;
}

// Chart data interface
export interface ChartData {
  activityData: { name: string; value: number }[];
  regionSchoolsData: { name: string; value: number }[];
  categoryCompletionData: { name: string; completed: number }[];
}

// SuperAdmin dashboard data
export interface SuperAdminDashboardData {
  stats: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
  };
  formsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  completionRate: number;
  pendingApprovals: PendingItem[];
  regions: RegionStats[];
  notifications: DashboardNotification[];
  categories?: CategoryStat[];
  users?: number;
  schools?: number;
  regionCount: number;
  sectorCount: number;
  schoolCount: number;
  userCount: number;
  approvalRate: number;
}

// Region admin dashboard data
export interface RegionAdminDashboardData {
  stats: {
    sectors: number;
    schools: number;
    users: number;
  };
  pendingItems: PendingItem[];
  categories: CategoryStat[];
  sectors: SectorCompletionItem[];
  sectorCompletions?: SectorCompletionItem[];
  pendingApprovals?: PendingItem[];
  notifications?: DashboardNotification[];
  recentActivities?: ActivityLogItem[];
  completionRate?: number;
  users?: number;
  schools?: number;
}

// Sector admin dashboard data
export interface SectorAdminDashboardData {
  stats: {
    schools: number;
    users?: number;
  };
  pendingItems: PendingItem[];
  schools: SchoolStat[];
  schoolsStats?: SchoolStat[];
  categories: CategoryStat[];
  completionRate?: number;
  notifications?: DashboardNotification[];
  activityLog?: ActivityLogItem[];
  recentActivities?: ActivityLogItem[];
}

// School admin dashboard data
export interface SchoolAdminDashboardData {
  formStats: FormStats;
  categories: CategoryStat[];
  notifications: DashboardNotification[];
  forms?: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    total: number;
  };
  pendingForms?: FormItem[];
  completionRate?: number;
  completion?: CompletionStats;
}

// Form statistics
export interface FormStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  drafts: number;
  incomplete: number;
}

// Activity log item
export interface ActivityLogItem {
  id: string;
  action: string;
  user: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  entity?: string;
  target?: string;
  details?: string;
  time?: string;
}

// Form status enum
export enum FormStatus {
  ALL = 'all',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DRAFT = 'draft',
  EXPIRED = 'expired',
  DUE_SOON = 'dueSoon',
  OVERDUE = 'overdue',
  COMPLETED = 'completed'
}

// Dashboard data type
export type DashboardData = 
  | SuperAdminDashboardData
  | RegionAdminDashboardData
  | SectorAdminDashboardData
  | SchoolAdminDashboardData;

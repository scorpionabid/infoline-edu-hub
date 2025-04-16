
// Dashboard notifications
export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
}

// Status items for dashboard
export interface StatsItem {
  title: string;
  count: number;
  description?: string;
  icon?: React.ReactNode;
  label?: string;
  value?: number;
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

// Sector completion item
export interface SectorCompletionItem {
  id: string;
  name: string;
  schoolCount: number;
  completionPercentage: number;
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
  recentActivities: ActivityLogItem[];
}

// Sector admin dashboard data
export interface SectorAdminDashboardData {
  stats: {
    schools: number;
    users?: number;
  };
  pendingItems: PendingItem[];
  schools: SchoolStat[];
  categories: CategoryStat[];
  recentActivities: ActivityLogItem[];
}

// School admin dashboard data
export interface SchoolAdminDashboardData {
  formStats: FormStats;
  categories: CategoryStat[];
  notifications: DashboardNotification[];
}

// Form statistics
export interface FormStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  drafts: number;
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
}

// RegionStats interface for region list
export interface RegionStats {
  id: string;
  name: string;
  sectorCount: number;
  schoolCount: number;
  adminEmail?: string;
  status?: string;
}

// Form status enum
export enum FormStatus {
  ALL = 'all',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DRAFT = 'draft',
  EXPIRED = 'expired'
}

// Dashboard types

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

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

export interface SuperAdminDashboardData {
  stats?: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
  };
  formStats?: DashboardFormStats;
  status?: DashboardStatus;
  completion?: DashboardCompletion;
  completionRate?: number;
  pendingApprovals?: PendingApproval[];
  regionStats?: RegionStat[] | any[];
  sectorStats?: SectorStat[] | any[];
  schoolStats?: SchoolStat[] | any[];
  categories?: CategoryItem[];
  notifications?: any[]; // DashboardNotification[] olmalıdır
}

export interface RegionAdminDashboardData {
  sectors?: { id: string; name: string; schoolCount: number; completionRate: number }[];
  schoolStats?: any[]; // SchoolStat[] olmalıdır
  status?: DashboardStatus;
  completion?: DashboardCompletion;
  completionRate?: number;
  pendingApprovals?: PendingApproval[];
  categories?: CategoryItem[];
  formStats?: DashboardFormStats;
  notifications?: any[]; // DashboardNotification[] olmalıdır
}

export interface SectorAdminDashboardData {
  schoolStats: any[]; // SchoolStat[] olmalıdır
  status: DashboardStatus;
  formStats?: DashboardFormStats;
  completion: DashboardCompletion;
  completionRate?: number;
  pendingApprovals: PendingApproval[];
  categories?: CategoryItem[];
  notifications?: any[]; // DashboardNotification[] olmalıdır
}

export interface SchoolAdminDashboardData {
  completion?: DashboardCompletion;
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
  categories?: CategoryItem[] | Category[];
  upcoming?: DeadlineItem[];
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
  notifications?: any[]; 
}

// Dashboard komponent propları
export interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

export interface RegionAdminDashboardProps {
  data: RegionAdminDashboardData;
  regionId?: string;
}

export interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
  sectorId?: string;
}

export interface SchoolAdminDashboardProps {
  data?: SchoolAdminDashboardData;
  isLoading?: boolean;
  error?: Error | string | null;
  onRefresh?: () => void;
  navigateToDataEntry?: () => void;
  handleFormClick?: (id: string) => void;
  schoolId?: string;
}

export interface StatusCardsProps {
  completion?: DashboardCompletion;
  status?: DashboardStatus;
  formStats?: DashboardFormStats;
}

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  status?: string;
  columns: any[]; // Column[] olmalıdır
}

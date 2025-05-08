
export interface DashboardStats {
  totalSchools: number;
  activeSchools: number;
  pendingSchools: number;
  completionRate: number;
}

export interface FormStats {
  completed: number;
  pending: number;
  totalForms: number;
  approved?: number;
  rejected?: number;
  dueSoon?: number;
  overdue?: number;
  draft?: number;
  total?: number;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string | Date;
  read: boolean;
  isRead?: boolean;
  priority: 'low' | 'medium' | 'high';
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface CategoryStat {
  id: string;
  name: string;
  completionRate: number;
  status: string;
  dueDate?: string | Date;
}

export interface SchoolCompletionData {
  schoolId: string;
  schoolName: string;
  completionRate: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  deadline?: string | Date;
  completionRate: number;
  status: string;
}

export interface DeadlineItem {
  id: string;
  categoryId: string;
  categoryName: string;
  deadline: string | Date;
  daysLeft: number;
  status: string;
}

export interface FormItem {
  id: string;
  categoryId: string;
  categoryName: string;
  status: string;
  submittedAt?: string | Date;
  updatedAt?: string | Date;
}

export interface SchoolAdminDashboardData {
  completion: {
    percentage: number;
    total: number;
    completed: number;
  };
  status: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
    total: number;
    active: number;
    inactive: number;
  };
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  formStats: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    draft: number;
    total: number;
  };
  pendingForms: FormItem[];
  completionRate: number;
  notifications: DashboardNotification[];
}

export interface PendingApproval {
  id: string;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  sectorId?: string;
  sectorName?: string;
  regionId?: string;
  regionName?: string;
  entryCount: number;
  status: string;
  submittedBy?: string;
  submittedAt?: string | Date;
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

export interface CategoryWithColumns {
  id: string;
  name: string;
  description?: string;
  status?: string;
  columns: any[];
  completionRate?: number;
  entries?: any[];
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

export interface SuperAdminDashboardData {
  stats?: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
  };
  formStats?: DashboardFormStats;
  status?: DashboardStatus;
  completion?: CompletionData;
  completionRate?: number;
  pendingApprovals?: PendingApproval[];
  regionStats?: RegionStat[] | any[];
  sectorStats?: SectorStat[] | any[];
  schoolStats?: SchoolStat[] | any[];
  categories?: CategoryItem[];
  notifications?: DashboardNotification[];
}

export interface RegionAdminDashboardData {
  sectors?: { id: string; name: string; schoolCount: number; completionRate: number }[];
  schoolStats?: SchoolStat[];
  status?: DashboardStatus;
  completion?: CompletionData;
  completionRate?: number;
  pendingApprovals?: PendingApproval[];
  categories?: CategoryItem[];
  formStats?: DashboardFormStats;
  notifications?: DashboardNotification[];
}

export interface SectorAdminDashboardData {
  schoolStats: any[];
  status: DashboardStatus;
  formStats?: DashboardFormStats;
  completion: CompletionData;
  completionRate?: number;
  pendingApprovals: PendingApproval[];
  categories?: CategoryItem[];
  notifications?: DashboardNotification[];
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

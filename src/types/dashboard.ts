
export type StatusType = 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'draft' | 'overdue' | 'dueSoon' | 'archived' | 'completed';

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface CompletionData {
  percentage: number;
  total: number;
  completed: number;
}

export interface StatusData {
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  total: number;
  active: number;
  inactive: number;
}

export interface FormStats {
  pending: number;
  approved: number;
  rejected: number;
  dueSoon: number;
  overdue: number;
  total: number;
  draft?: number;
}

export interface FormItem {
  id: string;
  name: string;
  status: StatusType;
  categoryName: string;
  submittedAt?: string;
  dueDate?: string;
  date?: string;
}

export interface DeadlineItem {
  id: string;
  name: string;
  status: StatusType;
  dueDate: string;
  progress: number;
  categoryName?: string;
  completionRate?: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  status: StatusType;
  completionRate: number;
  deadline: string;
}

export interface PendingApproval {
  id: string;
  schoolName: string;
  categoryName: string;
  submittedAt: string;
  status: StatusType;
  schoolId?: string;
  categoryId?: string;
  date?: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  status: StatusType;
  completionRate: number;
  lastUpdate: string;
  pendingForms: number;
  formsCompleted?: number;
  totalForms?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
  completion_rate?: number;
  updated_at?: string;
  principal_name?: string;
}

export interface SectorStat {
  id: string;
  name: string;
  schoolCount: number;
  completionRate: number;
  pendingApprovals: number;
}

export interface StatusCardsProps {
  completion: CompletionData;
  status: StatusData;
  formStats?: FormStats;
}

export interface SchoolAdminDashboardData {
  completion: CompletionData;
  status: StatusData;
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  formStats: FormStats;
  pendingForms: FormItem[];
  completionRate: number;
  notifications: any[];
}

export interface SectorAdminDashboardData {
  completion: CompletionData;
  status: StatusData;
  schoolStats: SchoolStat[];
  pendingApprovals: PendingApproval[];
  formStats?: FormStats;
}

export interface RegionAdminDashboardData {
  completion: CompletionData;
  status: StatusData;
  sectorStats: SectorStat[];
  pendingApprovals: PendingApproval[];
  schoolStats?: SchoolStat[];
  sectors?: SectorStat[];
  notifications?: any[];
}

export interface SuperAdminDashboardData {
  completion?: CompletionData;
  status?: StatusData;
  regionStats?: any[];
  sectorStats?: any[];
  schoolStats?: any[];
  regions?: number;
  sectors?: number;
  schools?: number;
  users?: number;
  completionRate?: number;
  notifications?: any[];
}

export interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
}

export interface SchoolAdminDashboardProps {
  data: SchoolAdminDashboardData;
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
  handleFormClick: (formId: string) => void;
  navigateToDataEntry: () => void;
  schoolId: string;
}

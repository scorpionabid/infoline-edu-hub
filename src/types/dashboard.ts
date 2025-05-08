
// Sistem və istifadəçi idarəetməsi üçün tiplər

export interface DashboardStats {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  forms?: number;
  completionRate?: number;
  pendingApprovals?: number;
}

// Tamamlanma və statistika tipləri
export interface CompletionData {
  completed: number;
  total: number;
  percentage: number;
}

export interface SchoolCompletionItem {
  id: string;
  name: string;
  completionRate: number;
  principal?: string;
  formsCompleted?: number;
  totalForms?: number;
}

export interface SectorCompletionItem {
  id: string;
  name: string;
  completionRate: number;
  schoolCount?: number;
  schoolsCount?: number;
  schoolStats?: SchoolCompletionItem[];
}

export interface DashboardCategory {
  id: string;
  name: string;
  completionRate?: number;
  deadline?: string | Date | null;
  columnsCount?: number;
}

export interface CategoryWithCompletion {
  id: string;
  name: string;
  description?: string;
  deadline?: string | null;
  completionRate: number;
  formsCompleted?: number;
  totalForms?: number;
}

// Əsas saylar tipləri
export interface DashboardCounts {
  regions: number;
  sectors: number;
  schools: number;
  categories: number;
  completedForms: number;
  pendingForms: number;
}

// Məlumat giriş və təsdiq tipləri
export interface PendingApproval {
  id: string;
  schoolName: string;
  categoryName: string;
  submittedBy?: string;
  submittedAt: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  schoolId?: string;
  categoryId?: string;
}

// Status və formlar üçün tiplər
export interface DashboardStatus {
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  total: number;
}

export interface DashboardFormStats {
  pending: number;
  approved: number;
  rejected: number;
  dueSoon?: number;
  overdue?: number;
  draft?: number;
  incomplete?: number;
  total: number;
}

// Bildirişlər tipi
export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  isRead: boolean;
  type: 'info' | 'warning' | 'error' | 'success' | 'deadline' | 'approval' | 'category' | 'system';
  link?: string;
  category?: string;
  priority?: 'normal' | 'high' | 'critical' | 'low' | 'medium';
  createdAt?: string;
  timestamp?: string;
  entity?: {
    type: string;
    id: string;
    name?: string;
  };
}

// Kateqoriyalar tipi
export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  submissionCount?: number;
  completionPercentage?: number;
  deadline?: string;
  dueDate?: string; 
  status: string;
  progress: number;
  categoryId?: string;
}

// Məktəb statistikası tipi
export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  status: string;
  lastUpdate: string;
  pendingForms: number;
  principal?: string;
  principalName?: string;
  formsCompleted?: number;
  totalForms?: number;
  address?: string;
  phone?: string;
  email?: string;
}

// Formlarla bağlı tiplər
export interface PendingForm {
  id: string;
  categoryName: string;
  deadline?: string;
  status: string;
  categoryId?: string;
  name?: string;
  title?: string;
  category?: string;
}

export interface UpcomingDeadline {
  id: string;
  categoryName: string;
  deadline: string;
  status: string;
  title?: string;
  completionRate?: number;
  daysRemaining?: number;
  categoryId?: string;
}

export interface DeadlineItem extends UpcomingDeadline {
  title: string;
  daysRemaining: number;
  completionRate: number;
  categoryId: string;
}

export interface FormItem {
  id: string;
  name: string;
  deadline?: string;
  status: string;
  completionRate?: number;
  categoryId: string;
  title: string;
  category: string;
  categoryName?: string;
}

// Dashboard verilənləri tiplər
export interface SchoolAdminDashboardData {
  completion: CompletionData;
  status: DashboardStatus;
  formStats?: DashboardFormStats;
  forms?: DashboardFormStats;
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  completionRate: number;
  notifications: DashboardNotification[];
}

export interface SchoolAdminDashboardProps {
  data?: SchoolAdminDashboardData;
  isLoading?: boolean;
  error?: Error | string | any;
  onRefresh?: () => void;
  navigateToDataEntry?: () => void;
  handleFormClick?: (formId: string) => void;
  schoolId?: string;
}

export interface SectorAdminDashboardData {
  completion: CompletionData;
  status: DashboardStatus;
  schoolStats: SchoolStat[];
  pendingApprovals: PendingApproval[];
  notifications?: DashboardNotification[];
  sectors?: SectorCompletionItem[];
  categories?: CategoryItem[];
}

export interface SectorAdminDashboardProps {
  data: SectorAdminDashboardData;
  sectorId?: string;
}

export interface RegionAdminDashboardData {
  completion: CompletionData;
  status: DashboardStatus;
  sectors: SectorCompletionItem[];
  notifications: DashboardNotification[];
  categories?: CategoryItem[];
  pendingApprovals: PendingApproval[];
  schoolStats?: SchoolStat[];
}

export interface RegionAdminDashboardProps {
  data: RegionAdminDashboardData;
  regionId?: string;
}

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
  notifications: DashboardNotification[];
}

export interface SuperAdminDashboardProps {
  data: SuperAdminDashboardData;
}

export interface StatusCardsProps {
  completion: CompletionData;
  status: DashboardStatus;
  formStats?: DashboardFormStats;
}

export interface ChartData {
  activityData: Array<{ name: string; value: number }>;
  regionSchoolsData: Array<{ name: string; value: number }>;
  categoryCompletionData: Array<{ name: string; completed: number }>;
}

export interface CategoryStat {
  id: string;
  name: string;
  completionRate: number;
  completion: CompletionData;
}

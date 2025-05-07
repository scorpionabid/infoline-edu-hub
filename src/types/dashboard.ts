
// Dashboard statistika tipləri
export interface DashboardStats {
  schools: {
    total: number;
    active: number;
    inactive: number;
  };
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
    total: number;
  };
  categories: {
    total: number;
    active: number;
    upcoming: number;
    expired: number;
  };
  users: {
    total: number;
    active: number;
    pending: number;
  };
  // Əlavə edilən sahələr
  regions?: {
    total: number;
    completed: number;
    inProgress: number;
  };
  sectors?: {
    total: number;
    completed: number;
    inProgress: number;
  };
  totalRegions?: number;
  totalSectors?: number;
  totalSchools?: number;
  totalUsers?: number;
  completionRate?: number;
}

// Form statistikaları
export interface FormStats {
  pending: number;
  approved: number;
  rejected: number;
  draft: number; // required field
  total: number;
}

// Form elementini təsvir edir
export interface FormItem {
  id: string;
  title: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  dueDate?: string;
  submitDate?: string;
  lastUpdate?: string;
}

// Dashboard kateqoriya məlumatları
export interface DashboardCategory {
  id: string;
  name: string;
  completionRate: number;
  dueDate?: string;
  status: string;
}

// Tamamlanma məlumatı ilə kateqoriya
export interface CategoryWithCompletion {
  id: string;
  name: string;
  completionRate: number;
  columnsCount: number;
  entriesCount: number;
}

// Məktəb tamamlanma elementi
export interface SchoolCompletionItem {
  id: string;
  name: string;
  completionRate: number;
  status: string;
  lastUpdate: string;
  pendingForms: number;
  formsCompleted?: number;
  totalForms?: number;
  principal?: string;
  address?: string;
  phone?: string;
  email?: string;
}

// Dashboard bildiriş tipi
export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  createdAt?: string;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
  link?: string;
  category?: string;
  entity?: {
    type: string;
    id: string;
    name?: string;
  };
}

// Sektor tamamlanma elementi
export interface SectorCompletionItem {
  id: string;
  name: string;
  completionRate: number;
  schoolCount: number;
  status: string;
}

// Tamamlanma statistikaları
export interface CompletionStats {
  total: number;
  completed: number;
  percentage: number;
}

// SuperAdmin dashboardu üçün məlumatlar
export interface SuperAdminDashboardData {
  stats: DashboardStats;
  completionRate?: number;
  categories?: CategoryWithCompletion[];
  formsByStatus?: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
  };
  regions?: SectorCompletionItem[];
  sectors?: SectorCompletionItem[];
  schools?: SchoolCompletionItem[];
  notifications?: DashboardNotification[];
  recentActivities?: ActivityLogItem[];
}

// RegionAdmin dashboardu üçün məlumatlar
export interface RegionAdminDashboardData {
  stats?: {
    totalSectors: number;
    totalSchools: number;
    totalForms: number;
    completion_rate?: number;
    pending_count?: number;
    pending_schools?: number;
    total_entries?: number;
  };
  region?: {
    id: string;
    name: string;
    status: string;
  };
  sectors?: {
    total: number;
    active: number;
  };
  schools?: {
    total: number;
    active: number;
  };
  completionRate?: number;
  sectorStats?: SectorCompletionItem[];
  notifications?: DashboardNotification[];
}

// SectorAdmin dashboardu üçün məlumatlar
export interface SectorAdminDashboardData {
  stats?: {
    totalSchools: number;
    totalEntries: number;
    pendingApprovals: number;
    completionRate: number;
  };
  sector?: {
    id: string;
    name: string;
    status: string;
    regionName: string;
  };
  schools?: SchoolCompletionItem[];
  completionRate?: number;
  pendingApprovals?: PendingApproval[];
  notifications?: DashboardNotification[];
}

// SchoolAdmin dashboardu üçün məlumatlar
export interface SchoolAdminDashboardData {
  stats?: {
    totalCategories: number;
    completedCategories: number;
    pendingCategories: number;
    completionRate: number;
  };
  school?: {
    id: string;
    name: string;
    sectorName: string;
    regionName: string;
    status: string;
  };
  completionRate?: number;
  categories?: CategoryWithCompletion[];
  formStats?: {
    pending: number;
    approved: number;
    rejected: number;
    draft: number;
    total: number;
  };
  upcomingDeadlines?: DeadlineItem[];
  notifications?: DashboardNotification[];
}

// Son tarix elementləri
export interface DeadlineItem {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  deadline: string;
  daysLeft: number;
  status: 'pending' | 'completed' | 'overdue';
}

// Fəaliyyət jurnalı elementi
export interface ActivityLogItem {
  id: string;
  action: string;
  user: string;
  entity: string;
  entityType: string;
  timestamp: string;
  details?: string;
}

// Gözləmədə olan təsdiq elementi
export interface PendingApproval {
  id: string;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  category: string;
  submittedDate: string;
  status: 'pending';
}

// StatusCards props tipi
export interface StatusCardsProps {
  completion: { total: number; completed: number; percentage: number };
  status: { pending: number; approved: number; rejected: number; total: number };
  formStats?: FormStats;
}

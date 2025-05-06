
declare module '@/types/dashboard' {
  export interface DashboardStats {
    totalRegions?: number;
    totalSectors?: number;
    totalSchools?: number;
    totalUsers?: number;
    totalEntries?: number;
    pendingApprovals?: number;
  }

  export interface RegionStats {
    total: number;
    active: number;
    inactive: number;
  }

  export interface SectorStats {
    total: number;
    active: number;
    inactive: number;
    length?: number; // Uyğunluq üçün əlavə edildi
  }

  export interface SchoolStats {
    total: number;
    active: number;
    incomplete: number;
    complete: number;
    id?: string; // SchoolsTable üçün əlavə edildi
    name?: string; // SchoolsTable üçün əlavə edildi
    address?: string; // SchoolsTable üçün əlavə edildi
    completionRate?: number; // SchoolsTable üçün əlavə edildi
    formsCompleted?: number; // SchoolsTable üçün əlavə edildi
    formsTotal?: number; // SchoolsTable üçün əlavə edildi
  }

  export interface FormStats {
    pending: number;
    approved: number;
    rejected: number;
    draft?: number;
    total: number;
    incomplete?: number;
    dueSoon?: number;
    overdue?: number;
  }

  export interface PendingApprovalItem {
    id: string;
    schoolId: string;
    schoolName: string;
    categoryId: string;
    categoryName: string;
    submittedAt: string;
    status: string;
  }

  export interface SuperAdminDashboardData {
    stats: DashboardStats;
    regions: RegionStats;
    sectors: SectorStats;
    schools: SchoolStats;
    forms: FormStats;
    pendingApprovals: PendingApprovalItem[];
    recentActivity: any[];
    notifications: any[];
  }

  export interface RegionAdminDashboardData {
    stats: {
      sectors: number;
      schools: number;
      users: number;
      totalSectors?: number; // Uyğunluq üçün əlavə edildi
      totalSchools?: number; // Uyğunluq üçün əlavə edildi
      totalForms?: number; // Uyğunluq üçün əlavə edildi
    };
    sectorStats?: SectorStats;
    schoolStats?: SchoolStats;
    formStats?: FormStats;
    pendingApprovals: PendingApprovalItem[];
    recentActivity: any[];
    notifications: any[];
    completionRate?: number;
  }

  export interface SchoolAdminDashboardData {
    stats: FormStats;
    formItems: FormItem[];
    notifications: any[];
    upcomingDeadlines?: any[]; // Uyğunluq üçün əlavə edildi
  }

  export interface FormItem {
    id: string;
    title: string;
    status: string;
    completionRate?: number;
    categoryName?: string; // Uyğunluq üçün əlavə edildi
    dueDate?: string; // Uyğunluq üçün əlavə edildi
    createdAt?: string; // Uyğunluq üçün əlavə edildi
  }
}

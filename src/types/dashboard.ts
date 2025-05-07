
// Sistem və istifadəçi idarəetməsi üçün tiplər

export interface DashboardStats {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  forms: number;
  completionRate: number;
  pendingApprovals: number;
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
  schoolCount: number;
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
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

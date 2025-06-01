
export interface DashboardFormStats {
  total: number;
  completed: number;
  approved: number;
  pending: number;
  rejected: number;
  draft: number;
  dueSoon: number;
  overdue: number;
  percentage: number;
  completion_rate: number;
  completionRate: number; // Add this missing property
}

export interface SuperAdminDashboardData {
  totalSchools: number;
  totalRegions: number;
  totalSectors: number;
  totalUsers: number;
  active: {
    schools: number;
    regions: number;
    sectors: number;
    users: number;
  };
  completion: number;
  completionRate: number;
  entryCount: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    draft: number;
    completed: number;
    percentage: number;
  };
  schoolData: any[];
  regionData: any[];
  categoryData: any[];
}

export interface FormTabsProps {
  categories: CategoryItem[];
  upcoming: DeadlineItem[];
  pendingForms: FormItem[];
  navigateToDataEntry: () => void;
  handleFormClick: (id: string) => void;
  onCategoryChange?: (categoryId: string) => void; // Add missing property
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  status: 'pending' | 'completed' | 'overdue';
  completionRate: number;
}

export interface DeadlineItem {
  id: string;
  name: string;
  deadline: string;
  daysLeft: number;
  status: 'upcoming' | 'overdue';
}

export interface FormItem {
  id: string;
  name: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  lastModified: string;
  completionRate: number;
}

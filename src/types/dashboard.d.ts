
export interface NotificationStats {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
}

export interface DeadlineItem {
  id: string;
  title: string;
  name: string;
  deadline: string;
  status: 'upcoming' | 'overdue' | 'completed';
  priority: 'high' | 'medium' | 'low';
  daysLeft: number;
}

export interface FormItem {
  id: string;
  title: string;
  category: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  progress: number;
  deadline: string;
  school_id: string;
}

export interface DashboardFormStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  dueSoon?: number;
  overdue?: number;
  completed: number;
  percentage: number;
  completion_rate: number;
  completionRate: number;
  active?: {
    schools: number;
    sectors: number;
    users: number;
  };
  inactive?: {
    schools: number;
    sectors: number;
    users: number;
  };
}

// Advanced Dashboard Data Types
export interface SuperAdminDashboardData {
  stats: {
    regions: number;
    sectors: number;
    schools: number;
    users: number;
  };
  regionCount: number;
  sectorCount: number;
  schoolCount: number;
  userCount: number;
  approvalRate: number;
  completionRate: number;
  regions: any[];
  pendingApprovals: any[];
  notifications: any[];
  formsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
}

export interface RegionAdminDashboardData {
  stats: {
    sectors: number;
    schools: number;
    users: number;
  };
  pendingItems: any[];
  categories: any[];
  sectors: any[];
  notifications: any[];
  completionRate: number;
}

export interface SectorAdminDashboardData {
  stats: {
    schools: number;
  };
  pendingItems: any[];
  schools: any[];
  categories: any[];
  notifications: any[];
  completionRate: number;
}

export interface SchoolAdminDashboardData {
  formStats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    drafts: number;
    incomplete: number;
  };
  categories: any[];
  notifications: any[];
  completionRate: number;
}

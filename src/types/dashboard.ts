
// Dashboard types - enhanced with missing exports

export interface DashboardStats {
  totalSchools: number;
  completedForms: number;
  pendingApprovals: number;
  overdueForms: number;
}

// Missing exports that were causing build errors
export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface DashboardCard {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon?: string;
}

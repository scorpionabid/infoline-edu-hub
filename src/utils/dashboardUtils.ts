
import { 
  SuperAdminDashboardData, 
  RegionAdminDashboardData, 
  SectorAdminDashboardData, 
  SchoolAdminDashboardData,
  DashboardNotification,
  ChartData
} from '@/types/dashboard';

// Status rəngləri və digər helper funksiyaları
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'text-yellow-500';
    case 'approved':
      return 'text-green-500';
    case 'rejected':
      return 'text-red-500';
    case 'dueSoon':
      return 'text-orange-500';
    case 'overdue':
      return 'text-red-600';
    default:
      return 'text-gray-500';
  }
};

export const getStatusBgColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100';
    case 'approved':
      return 'bg-green-100';
    case 'rejected':
      return 'bg-red-100';
    case 'dueSoon':
      return 'bg-orange-100';
    case 'overdue':
      return 'bg-red-100';
    default:
      return 'bg-gray-100';
  }
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('az-AZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatCompletionRate = (rate: number): string => {
  return `${Math.round(rate)}%`;
};

export const getDaysUntil = (dateString: string): number => {
  const today = new Date();
  const targetDate = new Date(dateString);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Bildiriş utilləri
export const getNotificationIcon = (type: string): string => {
  switch (type) {
    case 'info':
      return 'info-circle';
    case 'warning':
      return 'alert-triangle';
    case 'error':
      return 'alert-octagon';
    case 'success':
      return 'check-circle';
    default:
      return 'bell';
  }
};

export const getNotificationColor = (type: string): string => {
  switch (type) {
    case 'info':
      return 'text-blue-500';
    case 'warning':
      return 'text-yellow-500';
    case 'error':
      return 'text-red-500';
    case 'success':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
};

export const getPriorityLabel = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'Yüksək';
    case 'normal':
      return 'Normal';
    case 'low':
      return 'Aşağı';
    default:
      return 'Normal';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high':
      return 'text-red-500';
    case 'normal':
      return 'text-blue-500';
    case 'low':
      return 'text-green-500';
    default:
      return 'text-blue-500';
  }
};


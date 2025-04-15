import { DashboardNotification } from '@/types/dashboard';

export const generateMockNotifications = (): DashboardNotification[] => {
  return [
    {
      id: '1',
      title: 'Yeni kateqoriya əlavə edildi',
      message: 'Tədris resursları ilə bağlı yeni kateqoriya əlavə edildi',
      type: 'info',
      isRead: false,
      userId: '1',
      priority: 'normal',
      date: '2023-08-15',
      time: '10:30',
      createdAt: '2023-08-15T10:30:00Z',
    },
    {
      id: '2',
      title: 'Son tarix yaxınlaşır',
      message: 'Büdcə məlumatları kateqoriyası üçün son tarix 2 gün sonradır',
      type: 'warning',
      isRead: true,
      userId: '1',
      priority: 'high',
      date: '2023-08-16',
      time: '09:15',
      createdAt: '2023-08-16T09:15:00Z',
    },
    {
      id: '3',
      title: 'Məlumatlar təsdiqləndi',
      message: 'Şagird sayı kateqoriyası üçün məlumatlar təsdiqləndi',
      type: 'success',
      isRead: false,
      userId: '1',
      priority: 'normal',
      date: '2023-08-17',
      time: '14:45',
      createdAt: '2023-08-17T14:45:00Z',
    },
    {
      id: '4',
      title: 'Məlumatlar rədd edildi',
      message: 'Müəllim sayı kateqoriyası üçün məlumatlar rədd edildi',
      type: 'error',
      isRead: false,
      userId: '1',
      priority: 'high',
      date: '2023-08-18',
      time: '11:20',
      createdAt: '2023-08-18T11:20:00Z',
    },
    {
      id: '5',
      title: 'Yeni istifadəçi',
      message: 'Yeni istifadəçi sistemə əlavə edildi',
      type: 'info',
      isRead: true,
      userId: '1',
      priority: 'low',
      date: '2023-08-19',
      time: '16:30',
      createdAt: '2023-08-19T16:30:00Z',
    }
  ];
};

export const generateSuperAdminNotifications = (): DashboardNotification[] => {
  return [
    {
      id: '1',
      title: 'Yeni region əlavə edildi',
      message: 'Lənkəran bölgəsi sistemə əlavə edildi',
      type: 'info',
      isRead: false,
      userId: '1',
      priority: 'normal',
      date: '2023-08-15',
      time: '10:30',
      createdAt: '2023-08-15T10:30:00Z',
    },
    {
      id: '2',
      title: 'Yeni sektor əlavə edildi',
      message: 'Bakı şəhəri Sabunçu rayonu sistemə əlavə edildi',
      type: 'info',
      isRead: true,
      userId: '1',
      priority: 'normal',
      date: '2023-08-16',
      time: '09:15',
      createdAt: '2023-08-16T09:15:00Z',
    },
    {
      id: '3',
      title: 'Sistem yeniləməsi',
      message: 'Sistem yeniləməsi 2023-08-20 tarixində baş tutacaq',
      type: 'warning',
      isRead: false,
      userId: '1',
      priority: 'high',
      date: '2023-08-17',
      time: '14:45',
      createdAt: '2023-08-17T14:45:00Z',
    },
    {
      id: '4',
      title: 'Yeni kateqoriya',
      message: 'Yeni kateqoriya bütün məktəblərə təyin edildi',
      type: 'info',
      isRead: false,
      userId: '1',
      priority: 'normal',
      date: '2023-08-18',
      time: '11:20',
      createdAt: '2023-08-18T11:20:00Z',
    },
    {
      id: '5',
      title: 'Hesabat hazırdır',
      message: 'Aylıq hesabat hazırdır, yükləyə bilərsiniz',
      type: 'success',
      isRead: true,
      userId: '1',
      priority: 'normal',
      date: '2023-08-19',
      time: '16:30',
      createdAt: '2023-08-19T16:30:00Z',
    }
  ];
};

// Other utility functions
export const formatCompletionRate = (rate: number): string => {
  return `${Math.round(rate)}%`;
};

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

export const getDaysUntil = (dateString: string): number => {
  const today = new Date();
  const targetDate = new Date(dateString);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

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

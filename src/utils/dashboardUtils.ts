import { DashboardNotification, 
  SuperAdminDashboardData, 
  RegionAdminDashboardData, 
  SectorAdminDashboardData, 
  SchoolAdminDashboardData,
  StatsItem,
  RegionStat,
  SectorCompletion,
  SchoolStat,
  PendingItem,
  ChartData,
  CategoryStat
} from '@/types/dashboard';

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

export const createMockSuperAdminData = (): SuperAdminDashboardData => {
  return {
    stats: {
      regions: 10,
      sectors: 45,
      schools: 320,
      users: 587,
      categories: 12,
      columns: 78
    },
    regionStats: [
      { id: '1', name: 'Bakı', schoolCount: 120, completionRate: 85 },
      { id: '2', name: 'Sumqayıt', schoolCount: 45, completionRate: 72 },
      { id: '3', name: 'Gəncə', schoolCount: 38, completionRate: 68 },
      { id: '4', name: 'Lənkəran', schoolCount: 32, completionRate: 65 },
      { id: '5', name: 'Şəki', schoolCount: 28, completionRate: 60 }
    ],
    sectorCompletions: [
      { id: '1', name: 'Bakı Binəqədi', completionRate: 92 },
      { id: '2', name: 'Bakı Yasamal', completionRate: 88 },
      { id: '3', name: 'Bakı Nəsimi', completionRate: 85 },
      { id: '4', name: 'Bakı Səbail', completionRate: 82 },
      { id: '5', name: 'Bakı Nərimanov', completionRate: 80 }
    ],
    schoolStats: [
      { id: '1', name: 'Bakı 20 nömrəli məktəb', completionRate: 95 },
      { id: '2', name: 'Bakı 132 nömrəli məktəb', completionRate: 93 },
      { id: '3', name: 'Bakı 158 nömrəli məktəb', completionRate: 90 },
      { id: '4', name: 'Sumqayıt 3 nömrəli məktəb', completionRate: 88 },
      { id: '5', name: 'Gəncə 5 nömrəli məktəb', completionRate: 87 }
    ],
    pendingApprovals: [
      { id: '1', schoolName: 'Bakı 20 nömrəli məktəb', categoryName: 'Şagird statistikası', dueDate: '2025-04-20', submittedAt: '2025-04-15' },
      { id: '2', schoolName: 'Bakı 132 nömrəli məktəb', categoryName: 'Müəllim statistikası', dueDate: '2025-04-22', submittedAt: '2025-04-16' },
      { id: '3', schoolName: 'Sumqayıt 3 nömrəli məktəb', categoryName: 'Şagird statistikası', dueDate: '2025-04-25', submittedAt: '2025-04-18' }
    ],
    notifications: generateSuperAdminNotifications(),
    completionRate: 78
  };
};

export const createMockRegionAdminData = (): RegionAdminDashboardData => {
  return {
    stats: {
      sectors: 8,
      schools: 85,
      users: 120
    },
    pendingSchools: [
      { id: '1', name: 'Bakı 20 nömrəli məktəb', sectorName: 'Binəqədi', completionRate: 70 },
      { id: '2', name: 'Bakı 132 nömrəli məktəb', sectorName: 'Yasamal', completionRate: 65 },
      { id: '3', name: 'Bakı 158 nömrəli məktəb', sectorName: 'Nəsimi', completionRate: 60 }
    ],
    sectorStats: [
      { id: '1', name: 'Binəqədi', schoolCount: 25, completionRate: 75 },
      { id: '2', name: 'Yasamal', schoolCount: 20, completionRate: 70 },
      { id: '3', name: 'Nəsimi', schoolCount: 18, completionRate: 65 },
      { id: '4', name: 'Səbail', schoolCount: 12, completionRate: 60 },
      { id: '5', name: 'Nərimanov', schoolCount: 10, completionRate: 55 }
    ],
    sectorCompletions: [
      { id: '1', name: 'Binəqədi', completionRate: 75 },
      { id: '2', name: 'Yasamal', completionRate: 70 },
      { id: '3', name: 'Nəsimi', completionRate: 65 },
      { id: '4', name: 'Səbail', completionRate: 60 },
      { id: '5', name: 'Nərimanov', completionRate: 55 }
    ],
    categories: [
      { id: '1', name: 'Şagird statistikası', completionRate: 80, count: 75 },
      { id: '2', name: 'Müəllim statistikası', completionRate: 75, count: 70 },
      { id: '3', name: 'İnfrastruktur', completionRate: 65, count: 60 },
      { id: '4', name: 'Maliyyə', completionRate: 60, count: 55 }
    ],
    pendingApprovals: [
      { id: '1', schoolName: 'Bakı 20 nömrəli məktəb', categoryName: 'Şagird statistikası', dueDate: '2025-04-20', submittedAt: '2025-04-15' },
      { id: '2', schoolName: 'Bakı 132 nömrəli məktəb', categoryName: 'Müəllim statistikası', dueDate: '2025-04-22', submittedAt: '2025-04-16' }
    ],
    notifications: generateMockNotifications(),
    completionRate: 70
  };
};

export const createMockSectorAdminData = (): SectorAdminDashboardData => {
  return {
    stats: {
      schools: 25,
      users: 45
    },
    pendingApprovals: [
      { id: '1', schoolName: 'Bakı 20 nömrəli məktəb', categoryName: 'Şagird statistikası', submittedAt: '2025-04-15' },
      { id: '2', schoolName: 'Bakı 132 nömrəli məktəb', categoryName: 'Müəllim statistikası', submittedAt: '2025-04-16' }
    ],
    schoolsStats: [
      { id: '1', name: 'Bakı 20 nömrəli məktəb', completionRate: 85, pendingCount: 2 },
      { id: '2', name: 'Bakı 132 nömrəli məktəb', completionRate: 80, pendingCount: 3 },
      { id: '3', name: 'Bakı 158 nömrəli məktəb', completionRate: 75, pendingCount: 1 }
    ],
    pendingItems: [
      { id: '1', schoolName: 'Bakı 20 nömrəli məktəb', categoryName: 'Şagird statistikası', submittedAt: '2025-04-15' },
      { id: '2', schoolName: 'Bakı 132 nömrəli mktəb', categoryName: 'Müəllim statistikası', submittedAt: '2025-04-16' }
    ],
    activityLog: [
      { id: '1', action: 'submit', user: 'Əli Məmmədov', target: 'Şagird statistikası', date: '2025-04-15', time: '10:15' },
      { id: '2', action: 'approve', user: 'Aynur Əliyeva', target: 'Müəllim statistikası', date: '2025-04-16', time: '14:30' }
    ],
    notifications: generateMockNotifications(),
    completionRate: 80
  };
};

export const createMockSchoolAdminData = (): SchoolAdminDashboardData => {
  return {
    forms: {
      pending: 3,
      approved: 8,
      rejected: 1,
      dueSoon: 2,
      overdue: 1,
      total: 15
    },
    pendingForms: [
      { id: 'form-1', title: 'Şagird statistikası', status: 'pending', completionPercentage: 75, submittedAt: '2025-04-15', category: 'Təhsil statistikası' },
      { id: 'form-2', title: 'Müəllim heyəti', status: 'pending', completionPercentage: 60, submittedAt: '2025-04-16', category: 'Kadr məlumatları' },
      { id: 'form-3', title: 'İnfrastruktur hesabatı', status: 'dueSoon', completionPercentage: 40, submittedAt: '2025-04-17', category: 'İnfrastruktur' }
    ],
    notifications: generateMockNotifications(),
    completionRate: 65
  };
};

export const createMockChartData = (): ChartData => {
  return {
    activityData: [
      { name: 'Bazar ertəsi', value: 24 },
      { name: 'Çərşənbə axşamı', value: 32 },
      { name: 'Çərşənbə', value: 45 },
      { name: 'Cümə axşamı', value: 38 },
      { name: 'Cümə', value: 28 },
      { name: 'Şənbə', value: 12 },
      { name: 'Bazar', value: 8 }
    ],
    regionSchoolsData: [
      { name: 'Bakı', value: 120 },
      { name: 'Sumqayıt', value: 45 },
      { name: 'Gəncə', value: 38 },
      { name: 'Lənkəran', value: 32 },
      { name: 'Şəki', value: 28 }
    ],
    categoryCompletionData: [
      { name: 'Şagird statistikası', completed: 85 },
      { name: 'Müəllim statistikası', completed: 78 },
      { name: 'İnfrastruktur', completed: 65 },
      { name: 'Maliyyə', completed: 60 },
      { name: 'Tədris proqramı', completed: 72 }
    ]
  };
};

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

import { 
  SuperAdminDashboardData, 
  RegionAdminDashboardData, 
  SectorAdminDashboardData, 
  SchoolAdminDashboardData,
  ChartData,
  StatsItem
} from '@/types/dashboard';
import { Notification } from '@/types/notification';

// Mock bildiriş data generasiyası
const generateMockNotifications = (): Notification[] => {
  return [
    {
      id: '1',
      title: 'Yeni kateqoriya əlavə edildi',
      message: 'Tədris statistikası kateqoriyası sistemə əlavə edildi',
      type: 'category',
      isRead: false,
      createdAt: new Date().toISOString(),
      userId: 'user-1',
      priority: 'normal'
    },
    {
      id: '2',
      title: 'Son tarix bildirişi',
      message: 'Müəllim heyəti məlumatlarının doldurulma vaxtı sabah bitir',
      type: 'deadline',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      userId: 'user-1',
      priority: 'high'
    },
    {
      id: '3',
      title: 'Məlumat təsdiqi',
      message: 'Şagird statistikası təsdiq edildi',
      type: 'approval',
      isRead: false,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      userId: 'user-1',
      priority: 'normal'
    }
  ];
};

// Mock statistika generasiyası
const generateMockStats = (): StatsItem[] => {
  return [
    {
      id: '1',
      title: 'Ümumi məlumat doldurulma faizi',
      value: 78,
      change: 12,
      changeType: 'increase'
    },
    {
      id: '2',
      title: 'Bu ay əlavə edilən məlumatlar',
      value: 156,
      change: 8,
      changeType: 'increase'
    },
    {
      id: '3',
      title: 'Keçən aya nəzərən dəyişiklik',
      value: 23,
      change: 5,
      changeType: 'decrease'
    },
    {
      id: '4',
      title: 'Formların ortalama tamamlanma müddəti',
      value: 2.4,
      change: 0,
      changeType: 'neutral'
    }
  ];
};

// SuperAdmin üçün mock data generasiyası
export const generateSuperAdminData = (): SuperAdminDashboardData => {
  return {
    regions: 12,
    sectors: 48,
    schools: 645,
    users: 872,
    completionRate: 76,
    pendingApprovals: 34,
    notifications: generateMockNotifications(),
    stats: generateMockStats(),
    formsByStatus: {
      pending: 78,
      approved: 542,
      rejected: 21
    },
    regionStats: [
      {
        id: '1',
        name: 'Bakı',
        sectorCount: 12,
        schoolCount: 185,
        completionRate: 82
      },
      {
        id: '2',
        name: 'Sumqayıt',
        sectorCount: 8,
        schoolCount: 76,
        completionRate: 74
      },
      {
        id: '3',
        name: 'Gəncə',
        sectorCount: 6,
        schoolCount: 54,
        completionRate: 68
      }
    ]
  };
};

// RegionAdmin üçün mock data generasiyası
export const generateRegionAdminData = (): RegionAdminDashboardData => {
  return {
    sectors: 8,
    schools: 120,
    users: 145,
    completionRate: 72,
    pendingApprovals: 18,
    pendingSchools: 12,
    approvedSchools: 98,
    rejectedSchools: 10,
    notifications: generateMockNotifications(),
    stats: generateMockStats(),
    sectorCompletions: [
      {
        id: '1',
        name: 'Xətai',
        schoolCount: 24,
        completionPercentage: 85
      },
      {
        id: '2',
        name: 'Yasamal',
        schoolCount: 18,
        completionPercentage: 78
      },
      {
        id: '3',
        name: 'Nəsimi',
        schoolCount: 21,
        completionPercentage: 65
      }
    ]
  };
};

// SectorAdmin üçün mock data generasiyası
export const generateSectorAdminData = (): SectorAdminDashboardData => {
  return {
    schools: 24,
    completionRate: 68,
    pendingApprovals: 12,
    pendingSchools: 8,
    approvedSchools: 14,
    rejectedSchools: 2,
    notifications: generateMockNotifications(),
    stats: generateMockStats(),
    schoolStats: [
      {
        id: '1',
        name: '20 nömrəli məktəb',
        completionRate: 92,
        pending: 2
      },
      {
        id: '2',
        name: '45 nömrəli məktəb',
        completionRate: 76,
        pending: 5
      },
      {
        id: '3',
        name: '158 nömrəli məktəb',
        completionRate: 54,
        pending: 8
      }
    ]
  };
};

// SchoolAdmin üçün mock data generasiyası
export const generateSchoolAdminData = (): SchoolAdminDashboardData => {
  return {
    forms: {
      pending: 5,
      approved: 12,
      rejected: 2,
      total: 19,
      dueSoon: 3,
      overdue: 1
    },
    completionRate: 68,
    notifications: generateMockNotifications(),
    pendingForms: [
      {
        id: 'form-1',
        title: 'Şagird statistikası',
        date: '2025-04-15',
        status: 'pending',
        completionPercentage: 75,
        category: 'Təhsil statistikası'
      },
      {
        id: 'form-2',
        title: 'Müəllim heyəti',
        date: '2025-04-20',
        status: 'pending',
        completionPercentage: 50,
        category: 'Kadr məlumatları'
      },
      {
        id: 'form-3',
        title: 'İnfrastruktur hesabatı',
        date: '2025-04-18',
        status: 'dueSoon',
        completionPercentage: 30,
        category: 'İnfrastruktur'
      }
    ]
  };
};

// İstifadəçi roluna görə mock data generasiyası
export const generateDashboardDataByRole = (role: string): any => {
  switch (role) {
    case 'superadmin':
      return generateSuperAdminData();
    case 'regionadmin':
      return generateRegionAdminData();
    case 'sectoradmin':
      return generateSectorAdminData();
    case 'schooladmin':
    default:
      return generateSchoolAdminData();
  }
};

// Chart data generasiyası üçün funksiya
export const generateMockChartData = (): ChartData => {
  return {
    activityData: [
      { name: 'Yan', value: 34 },
      { name: 'Fev', value: 45 },
      { name: 'Mar', value: 58 },
      { name: 'Apr', value: 42 },
      { name: 'May', value: 68 },
      { name: 'İyn', value: 72 }
    ],
    regionSchoolsData: [
      { name: 'Bakı', value: 185 },
      { name: 'Sumqayıt', value: 76 },
      { name: 'Gəncə', value: 54 },
      { name: 'Lənkəran', value: 42 },
      { name: 'Şəki', value: 38 }
    ],
    categoryCompletionData: [
      { name: 'Şagird statistikası', completed: 85 },
      { name: 'Müəllim heyəti', completed: 72 },
      { name: 'İnfrastruktur', completed: 64 },
      { name: 'Tədris proqramı', completed: 92 },
      { name: 'Maliyyə hesabatları', completed: 58 }
    ]
  };
};

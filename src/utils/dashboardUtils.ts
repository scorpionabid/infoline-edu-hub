
import { 
  SuperAdminDashboardData, 
  RegionAdminDashboardData, 
  SectorAdminDashboardData, 
  SchoolAdminDashboardData,
  ChartData,
  StatsItem,
  EntityCount,
  UserEntityCount
} from '@/types/dashboard';
import { Notification } from '@/types/notification';
import { generateRandomId } from '@/utils/helpers';

// Mock bildiriş data generasiyası
const generateMockNotifications = (): Notification[] => {
  return [
    {
      id: '1',
      title: 'Yeni kateqoriya əlavə edildi',
      message: 'Tədris statistikası kateqoriyası sistemə əlavə edildi',
      type: 'category',
      isRead: false,
      created_at: new Date().toISOString(),
      userId: 'user-1',
      priority: 'normal'
    },
    {
      id: '2',
      title: 'Son tarix bildirişi',
      message: 'Müəllim heyəti məlumatlarının doldurulma vaxtı sabah bitir',
      type: 'deadline',
      isRead: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      userId: 'user-1',
      priority: 'high'
    },
    {
      id: '3',
      title: 'Məlumat təsdiqi',
      message: 'Şagird statistikası təsdiq edildi',
      type: 'approval',
      isRead: false,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      userId: 'user-1',
      priority: 'normal'
    }
  ];
};

// Mock statistika generasiyası
const generateMockStats = (): StatsItem[] => {
  return [
    {
      id: generateRandomId(),
      title: 'Ümumi məlumat doldurulma faizi',
      value: 78,
      change: 12,
      changeType: 'increase'
    },
    {
      id: generateRandomId(),
      title: 'Bu ay əlavə edilən məlumatlar',
      value: 156,
      change: 8,
      changeType: 'increase'
    },
    {
      id: generateRandomId(),
      title: 'Keçən aya nəzərən dəyişiklik',
      value: 23,
      change: 5,
      changeType: 'decrease'
    },
    {
      id: generateRandomId(),
      title: 'Formların ortalama tamamlanma müddəti',
      value: 2.4,
      change: 0,
      changeType: 'neutral'
    }
  ];
};

// SuperAdmin üçün mock data generasiyası
export const generateSuperAdminData = (): SuperAdminDashboardData => {
  const regions: EntityCount = { total: 12, active: 10, inactive: 2 };
  const sectors: EntityCount = { total: 48, active: 45, inactive: 3 };
  const schools: EntityCount = { total: 645, active: 620, inactive: 25 };
  const users: UserEntityCount = { 
    total: 872, 
    active: 850, 
    inactive: 22,
    byRole: {
      superadmin: 5,
      regionadmin: 12,
      sectoradmin: 48,
      schooladmin: 645
    }
  };
  
  return {
    regions,
    sectors,
    schools,
    users,
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
  const sectors: EntityCount = { total: 8, active: 8, inactive: 0 };
  const schools: EntityCount = { total: 120, active: 118, inactive: 2 };
  const users: UserEntityCount = { 
    total: 145, 
    active: 140, 
    inactive: 5,
    byRole: {
      sectoradmin: 8,
      schooladmin: 120
    }
  };
  
  return {
    regionName: 'Bakı',
    sectors,
    schools,
    users,
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
  const schools: EntityCount = { total: 24, active: 24, inactive: 0 };
  
  return {
    sectorName: 'Xətai',
    regionName: 'Bakı',
    schools,
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
    schoolName: '45 nömrəli məktəb',
    sectorName: 'Xətai',
    regionName: 'Bakı',
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
      { name: 'Şagird statistikası', value: 85 },
      { name: 'Müəllim heyəti', value: 72 },
      { name: 'İnfrastruktur', value: 64 },
      { name: 'Tədris proqramı', value: 92 },
      { name: 'Maliyyə hesabatları', value: 58 }
    ]
  };
};

import { 
  DashboardNotification, 
  SchoolAdminDashboardData, 
  FormItem, 
  StatsItem,
  RegionStat,
  CategoryStat,
  SectorCompletion,
  SchoolStat,
  PendingItem,
  ActivityLogItem,
  ChartData,
  SuperAdminDashboardData,
  RegionAdminDashboardData,
  SectorAdminDashboardData,
  DashboardData
} from '@/types/dashboard';

/**
 * Mock məktəb admin dashboard məlumatları yaradır
 * @returns SchoolAdminDashboardData
 */
export const createMockSchoolAdminData = (): SchoolAdminDashboardData => {
  const now = new Date();
  const notifications: DashboardNotification[] = [
    {
      id: '1',
      title: 'Yeni kateqoriya əlavə edildi',
      message: 'Tədris statistikası kateqoriyası sistemə əlavə edildi',
      type: 'category',
      isRead: false,
      userId: 'user-1',
      priority: 'normal',
      date: now.toISOString(),
      time: `${now.getHours()}:${now.getMinutes()}`
    },
    {
      id: '2',
      title: 'Son tarix bildirişi',
      message: 'Müəllim heyəti məlumatlarının doldurulma vaxtı sabah bitir',
      type: 'deadline',
      isRead: true,
      userId: 'user-1',
      priority: 'high',
      date: new Date(Date.now() - 86400000).toISOString(),
      time: '14:30'
    }
  ];

  const pendingForms: FormItem[] = [
    {
      id: 'form-1',
      title: 'Şagird statistikası',
      date: '2025-04-15',
      status: 'pending',
      completionPercentage: 75,
      category: 'Təhsil statistikası',
      description: 'Şagird sayı və akademik göstəricilər'
    },
    {
      id: 'form-2',
      title: 'Müəllim heyəti',
      date: '2025-04-20',
      status: 'pending',
      completionPercentage: 50,
      category: 'Kadr məlumatları',
      description: 'Müəllim heyəti haqqında detallı məlumatlar'
    },
    {
      id: 'form-3',
      title: 'İnfrastruktur hesabatı',
      date: '2025-04-18',
      status: 'dueSoon',
      completionPercentage: 30,
      category: 'İnfrastruktur',
      description: 'Məktəbin infrastrukturu haqqında hesabat'
    }
  ];

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
    notifications,
    pendingForms
  };
};

/**
 * Sektor admin mock dashboard məlumatları yaradır
 */
export const createMockSectorAdminData = (): SectorAdminDashboardData => {
  const now = new Date();
  const notifications: DashboardNotification[] = [
    {
      id: '1',
      title: 'Məktəb məlumatlarını təsdiqlədi',
      message: 'Bakı 45 saylı orta məktəb yeni məlumatları təsdiq üçün göndərdi',
      type: 'approval',
      isRead: false,
      userId: 'user-1',
      priority: 'normal',
      date: now.toISOString(),
      time: `${now.getHours()}:${now.getMinutes()}`
    }
  ];

  const schoolStats: SchoolStat[] = [
    {
      id: 'school-1',
      name: 'Bakı 45 saylı orta məktəb',
      completionRate: 78,
      pending: 3
    },
    {
      id: 'school-2',
      name: 'Bakı 28 saylı orta məktəb',
      completionRate: 92,
      pending: 1
    },
    {
      id: 'school-3',
      name: 'Bakı 189 saylı orta məktəb',
      completionRate: 65,
      pending: 5
    }
  ];

  const pendingItems: PendingItem[] = [
    {
      id: 'pending-1',
      school: 'Bakı 45 saylı orta məktəb',
      category: 'Şagird statistikası',
      date: '2025-04-10',
      status: 'pending'
    },
    {
      id: 'pending-2',
      school: 'Bakı 28 saylı orta məktəb',
      category: 'Müəllim heyəti',
      date: '2025-04-12',
      status: 'pending'
    }
  ];

  const activityLog: ActivityLogItem[] = [
    {
      id: 'activity-1',
      action: 'Məlumat təsdiqləndi',
      target: 'Bakı 189 saylı orta məktəb - Şagird statistikası',
      time: '2 saat əvvəl'
    },
    {
      id: 'activity-2',
      action: 'Məlumat rədd edildi',
      target: 'Bakı 28 saylı orta məktəb - İnfrastruktur hesabatı',
      time: '5 saat əvvəl'
    }
  ];

  const categoryCompletion: CategoryStat[] = [
    {
      id: 'category-1',
      name: 'Şagird statistikası',
      completionRate: 85,
      color: '#4CAF50'
    },
    {
      id: 'category-2',
      name: 'Müəllim heyəti',
      completionRate: 72,
      color: '#2196F3'
    },
    {
      id: 'category-3',
      name: 'İnfrastruktur hesabatı',
      completionRate: 60,
      color: '#FFC107'
    }
  ];

  return {
    schools: 15,
    completionRate: 75,
    pendingApprovals: 8,
    pendingSchools: 5,
    approvedSchools: 10,
    rejectedSchools: 0,
    notifications,
    stats: [
      {
        id: 'stat-1',
        title: 'Təsdiqlənmiş məlumatlar',
        value: 45,
        change: 12,
        changeType: 'increase' as 'increase' | 'decrease' | 'neutral'
      },
      {
        id: 'stat-2',
        title: 'Rədd edilmiş məlumatlar',
        value: 7,
        change: 2,
        changeType: 'increase' as 'increase' | 'decrease' | 'neutral'
      },
      {
        id: 'stat-3',
        title: 'Tamamlanma faizi',
        value: 75,
        change: 5,
        changeType: 'increase' as 'increase' | 'decrease' | 'neutral'
      }
    ],
    schoolStats,
    pendingItems,
    categoryCompletion,
    activityLog
  };
};

/**
 * Region admin mock dashboard məlumatları yaradır
 */
export const createMockRegionAdminData = (): RegionAdminDashboardData => {
  const now = new Date();
  const notifications: DashboardNotification[] = [
    {
      id: '1',
      title: 'Yeni sektor əlavə edildi',
      message: 'Yasamal rayonu üçün yeni sektor əlavə edildi',
      type: 'system',
      isRead: false,
      userId: 'user-1',
      priority: 'normal',
      date: now.toISOString(),
      time: `${now.getHours()}:${now.getMinutes()}`
    }
  ];

  const categories: CategoryStat[] = [
    {
      id: 'category-1',
      name: 'Şagird statistikası',
      completionRate: 82,
      color: '#4CAF50'
    },
    {
      id: 'category-2',
      name: 'Müəllim heyəti',
      completionRate: 68,
      color: '#2196F3'
    },
    {
      id: 'category-3',
      name: 'İnfrastruktur hesabatı',
      completionRate: 55,
      color: '#FFC107'
    }
  ];

  const sectorCompletions: SectorCompletion[] = [
    {
      id: 'sector-1',
      name: 'Bakı şəhəri Yasamal rayonu',
      completionRate: 85,
      schoolCount: 12
    },
    {
      id: 'sector-2',
      name: 'Bakı şəhəri Nəsimi rayonu',
      completionRate: 78,
      schoolCount: 15
    },
    {
      id: 'sector-3',
      name: 'Bakı şəhəri Nizami rayonu',
      completionRate: 62,
      schoolCount: 10
    }
  ];

  return {
    sectors: 6,
    schools: 80,
    users: 120,
    completionRate: 75,
    pendingApprovals: 23,
    pendingSchools: 15,
    approvedSchools: 65,
    rejectedSchools: 0,
    notifications,
    stats: [
      {
        id: 'stat-1',
        title: 'Aktiv məktəblər',
        value: 80,
        change: 5,
        changeType: 'increase' as 'increase' | 'decrease' | 'neutral'
      },
      {
        id: 'stat-2',
        title: 'Tamamlanma faizi',
        value: 75,
        change: 12,
        changeType: 'increase' as 'increase' | 'decrease' | 'neutral'
      },
      {
        id: 'stat-3',
        title: 'İstifadəçilər',
        value: 120,
        change: 10,
        changeType: 'increase' as 'increase' | 'decrease' | 'neutral'
      }
    ],
    categories,
    sectorCompletions
  };
};

/**
 * Superadmin mock dashboard məlumatları yaradır
 */
export const createMockSuperAdminData = (): SuperAdminDashboardData => {
  const now = new Date();
  const notifications: DashboardNotification[] = [
    {
      id: '1',
      title: 'Sistem yeniləməsi',
      message: 'Sistem versiyası v1.2.0-a yüksəldi',
      type: 'system',
      isRead: false,
      userId: 'user-1',
      priority: 'normal',
      date: now.toISOString(),
      time: `${now.getHours()}:${now.getMinutes()}`
    }
  ];

  const regionStats: RegionStat[] = [
    {
      id: 'region-1',
      name: 'Bakı şəhəri',
      sectorCount: 12,
      schoolCount: 120,
      completionRate: 82
    },
    {
      id: 'region-2',
      name: 'Sumqayıt şəhəri',
      sectorCount: 5,
      schoolCount: 40,
      completionRate: 75
    },
    {
      id: 'region-3',
      name: 'Gəncə şəhəri',
      sectorCount: 4,
      schoolCount: 35,
      completionRate: 68
    }
  ];

  return {
    regions: 15,
    sectors: 45,
    schools: 400,
    users: 550,
    completionRate: 78,
    pendingApprovals: 56,
    notifications,
    stats: [
      {
        id: 'stat-1',
        title: 'Aktiv məktəblər',
        value: 400,
        change: 12,
        changeType: 'increase' as 'increase' | 'decrease' | 'neutral'
      },
      {
        id: 'stat-2',
        title: 'Tamamlanma faizi',
        value: 78,
        change: 5,
        changeType: 'increase' as 'increase' | 'decrease' | 'neutral'
      },
      {
        id: 'stat-3',
        title: 'İstifadəçilər',
        value: 550,
        change: 25,
        changeType: 'increase' as 'increase' | 'decrease' | 'neutral'
      }
    ],
    formsByStatus: {
      pending: 145,
      approved: 822,
      rejected: 56
    },
    regionStats
  };
};

/**
 * Mock qrafik məlumatları yaradır
 */
export const createMockChartData = (): ChartData => {
  return {
    activityData: [
      { name: 'Yanvar', value: 400 },
      { name: 'Fevral', value: 300 },
      { name: 'Mart', value: 200 },
      { name: 'Aprel', value: 278 },
      { name: 'May', value: 189 },
    ],
    regionSchoolsData: [
      { name: 'Bakı', value: 120 },
      { name: 'Sumqayıt', value: 50 },
      { name: 'Gəncə', value: 40 },
      { name: 'Şəki', value: 30 },
      { name: 'Lənkəran', value: 20 },
    ],
    categoryCompletionData: [
      { name: 'Şagird Statistikası', completed: 85 },
      { name: 'Müəllim Statistikası', completed: 72 },
      { name: 'İnfrastruktur', completed: 60 },
      { name: 'Texniki Avadanlıq', completed: 45 },
      { name: 'Tədris Materialları', completed: 55 },
    ]
  };
};

/**
 * İstifadəçi roluna əsasən mock dashboard məlumatları təqdim edən funksiya
 * @param userRole İstifadəçi rolu
 * @returns DashboardData
 */
export function generateDashboardDataByRole(userRole?: string): DashboardData {
  switch (userRole) {
    case 'superadmin':
      return createMockSuperAdminData();
    case 'regionadmin':
      return createMockRegionAdminData();
    case 'sectoradmin':
      return createMockSectorAdminData();
    case 'schooladmin':
      return createMockSchoolAdminData();
    default:
      return createMockSuperAdminData();
  }
}

export const generateNotification = (id: string, title: string, message: string, type: string) => {
  return {
    id,
    title,
    message,
    type,
    isRead: false,
    userId: 'user1',
    priority: 'normal',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    createdAt: new Date().toISOString()
  };
};

export const generateReadNotification = (id: string, title: string, message: string, type: string) => {
  return {
    id,
    title,
    message,
    type,
    isRead: true,
    userId: 'user1',
    priority: 'normal',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    createdAt: new Date().toISOString()
  };
};

export const generateSectorNotifications = () => {
  return [
    {
      id: '1',
      title: 'Yeni məktəb məlumatları',
      message: 'Bakı şəhəri, 132 saylı məktəb statistikasını göndərdi',
      type: 'form',
      isRead: false,
      userId: 'user1',
      priority: 'normal',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: '6 məktəb məlumatlarını tamamlamayıb',
      message: 'Son tarixə 2 gün qalmış',
      type: 'deadline',
      isRead: false,
      userId: 'user1',
      priority: 'high',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Yeni kateqoriya əlavə edildi',
      message: '2023-2024 tədris ili statistikası',
      type: 'category',
      isRead: false,
      userId: 'user1',
      priority: 'normal',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      createdAt: new Date().toISOString()
    }
  ];
};

export const generateRegionNotifications = () => {
  return [
    {
      id: '1',
      title: 'Yeni sektorlar üçün məlumat tələbi',
      message: 'Bütün sektorlar üçün yeni statistik məlumatlar tələb olunur',
      type: 'system',
      isRead: false,
      userId: 'user1',
      priority: 'normal',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Məlumat yoxlama tələbi',
      message: 'Sumqayıt sektorunun göndərdiyi məlumatlar yoxlanılmalıdır',
      type: 'approval',
      isRead: false,
      userId: 'user1',
      priority: 'high',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Hesabat hazırdır',
      message: 'Regionun aylıq hesabatı hazırdır. Baxış üçün klikləyin.',
      type: 'form',
      isRead: false,
      userId: 'user1',
      priority: 'normal',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      createdAt: new Date().toISOString()
    }
  ];
};

export const generateSuperAdminNotifications = () => {
  return [
    {
      id: '1',
      title: 'Sistem yenilənməsi',
      message: 'InfoLine sistemi uğurla v2.5 versiyasına yeniləndi',
      type: 'system',
      isRead: false,
      userId: 'user1',
      priority: 'normal',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Region aktivliyi',
      message: 'Bakı regionu bütün məlumatlarını tamamladı',
      type: 'form',
      isRead: false,
      userId: 'user1',
      priority: 'normal',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Təsdiq gözləyən regionlar',
      message: '3 region təsdiq gözləyir',
      type: 'approval',
      isRead: false,
      userId: 'user1',
      priority: 'high',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      createdAt: new Date().toISOString()
    }
  ];
};

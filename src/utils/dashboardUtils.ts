
import { ChartData, DashboardData, StatsItem, RegionStat, CategoryStat, SectorCompletion, SchoolStat, PendingItem, ActivityLogItem, FormItem, DashboardNotification } from '@/types/dashboard';
import { UserRole } from '@/types/user';

const getRandomChange = () => {
  const value = Math.floor(Math.random() * 30);
  return {
    value,
    type: Math.random() > 0.5 ? 'increase' : 'decrease'
  };
};

export function generateDashboardDataByRole(role: UserRole): DashboardData {
  const notifications: DashboardNotification[] = [
    {
      id: '1',
      type: 'info',
      title: 'Yeni bildiriş',
      message: 'Sistem yeniləndi',
      isRead: false,
      createdAt: new Date().toISOString(),
      userId: '1',
      priority: 'normal',
      time: '10:45',
      date: '2023-10-15',
    },
    {
      id: '2',
      type: 'warning',
      title: 'Son tarix yaxınlaşır',
      message: 'Şagird məlumatlarını doldurmaq üçün 2 gün qalıb',
      isRead: false,
      createdAt: new Date().toISOString(),
      userId: '1',
      priority: 'high',
      time: '14:30',
      date: '2023-10-14',
    }
  ];

  const stats: StatsItem[] = [
    {
      id: '1',
      title: 'Ümumi İstifadəçilər',
      value: 1250,
      change: 12,
      changeType: 'increase'
    },
    {
      id: '2',
      title: 'Ümumi Məktəblər',
      value: 657,
      change: 5,
      changeType: 'increase'
    },
    {
      id: '3',
      title: 'Tamamlanma Dərəcəsi',
      value: 76,
      change: 3,
      changeType: 'increase'
    },
    {
      id: '4',
      title: 'Təsdiq Gözləyən',
      value: 24,
      change: 8,
      changeType: 'decrease'
    }
  ];

  // SuperAdmin data
  if (role === 'superadmin') {
    return {
      regions: 12,
      sectors: 45,
      schools: 657,
      users: 1250,
      completionRate: 76,
      pendingApprovals: 24,
      notifications,
      stats,
      formsByStatus: {
        pending: 24,
        approved: 542,
        rejected: 15
      },
      regionStats: [
        {
          id: '1',
          name: 'Bakı',
          sectorCount: 12,
          schoolCount: 185,
          completionRate: 85
        },
        {
          id: '2',
          name: 'Sumqayıt',
          sectorCount: 5,
          schoolCount: 76,
          completionRate: 72
        },
        {
          id: '3',
          name: 'Gəncə',
          sectorCount: 4,
          schoolCount: 54,
          completionRate: 68
        }
      ]
    };
  }

  // RegionAdmin data
  if (role === 'regionadmin') {
    return {
      sectors: 5,
      schools: 76,
      users: 120,
      completionRate: 72,
      pendingApprovals: 15,
      pendingSchools: 8,
      approvedSchools: 65,
      rejectedSchools: 3,
      notifications,
      stats,
      categories: [
        {
          id: '1',
          name: 'Şagird statistikası',
          completionRate: 85,
          color: '#4CAF50'
        },
        {
          id: '2',
          name: 'Müəllim heyəti',
          completionRate: 72,
          color: '#2196F3'
        },
        {
          id: '3',
          name: 'İnfrastruktur',
          completionRate: 63,
          color: '#FF9800'
        }
      ],
      sectorCompletions: [
        {
          id: '1',
          name: 'Sabunçu',
          completionRate: 85,
          schoolCount: 25
        },
        {
          id: '2',
          name: 'Xətai',
          completionRate: 72,
          schoolCount: 18
        },
        {
          id: '3',
          name: 'Binəqədi',
          completionRate: 68,
          schoolCount: 22
        }
      ]
    };
  }

  // SectorAdmin data
  if (role === 'sectoradmin') {
    return {
      schools: 25,
      completionRate: 85,
      pendingApprovals: 7,
      pendingSchools: 4,
      approvedSchools: 20,
      rejectedSchools: 1,
      notifications,
      stats,
      schoolStats: [
        {
          id: '1',
          name: '20 saylı məktəb',
          completionRate: 100,
          pending: 0
        },
        {
          id: '2',
          name: '153 saylı məktəb',
          completionRate: 85,
          pending: 2
        },
        {
          id: '3',
          name: '84 saylı məktəb',
          completionRate: 70,
          pending: 5
        }
      ],
      pendingItems: [
        {
          id: '1',
          school: '153 saylı məktəb',
          category: 'Şagird statistikası',
          date: '2023-10-16'
        },
        {
          id: '2',
          school: '84 saylı məktəb',
          category: 'Müəllim heyəti',
          date: '2023-10-15'
        }
      ],
      categoryCompletion: [
        {
          id: '1',
          name: 'Şagird statistikası',
          completionRate: 85,
          color: '#4CAF50'
        },
        {
          id: '2',
          name: 'Müəllim heyəti',
          completionRate: 72,
          color: '#2196F3'
        }
      ],
      activityLog: [
        {
          id: '1',
          action: 'Məlumat təsdiqləndi',
          target: '20 saylı məktəb - Şagird statistikası',
          time: '2 saat öncə'
        },
        {
          id: '2',
          action: 'Məlumat rədd edildi',
          target: '84 saylı məktəb - Müəllim heyəti',
          time: '5 saat öncə'
        }
      ]
    };
  }

  // SchoolAdmin data
  return {
    forms: {
      pending: 1,
      approved: 4,
      rejected: 1,
      total: 6,
      dueSoon: 2,
      overdue: 0
    },
    completionRate: 85,
    notifications,
    pendingForms: [
      {
        id: '1',
        title: 'Şagird statistikası',
        status: 'pending',
        completionPercentage: 100,
        date: '2023-10-18',
        description: 'Təsdiq gözləyir'
      },
      {
        id: '2',
        title: 'Müəllim heyəti',
        status: 'rejected',
        completionPercentage: 80,
        date: '2023-10-15',
        description: 'Düzəliş tələb olunur'
      }
    ]
  };
}

export function createMockChartData(): ChartData {
  return {
    activityData: [
      { name: 'Yanvar', value: 145 },
      { name: 'Fevral', value: 230 },
      { name: 'Mart', value: 275 },
      { name: 'Aprel', value: 310 },
      { name: 'May', value: 350 },
      { name: 'İyun', value: 420 },
      { name: 'İyul', value: 380 }
    ],
    regionSchoolsData: [
      { name: 'Bakı', value: 185 },
      { name: 'Sumqayıt', value: 76 },
      { name: 'Gəncə', value: 54 },
      { name: 'Mingəçevir', value: 28 },
      { name: 'Şirvan', value: 23 }
    ],
    categoryCompletionData: [
      { name: 'Şagird statistikası', completed: 85 },
      { name: 'Müəllim heyəti', completed: 72 },
      { name: 'İnfrastruktur', completed: 63 },
      { name: 'Tədris proqramı', completed: 91 },
      { name: 'İnzibati işlər', completed: 56 }
    ]
  };
}


import { FormItem, StatsItem, DashboardNotification, DashboardData, ChartData, SuperAdminDashboardData, RegionAdminDashboardData, SectorAdminDashboardData, SchoolAdminDashboardData } from '@/hooks/useDashboardData';

// Mock data generatoru - istifadəçi tipinə görə dashboard məlumatlarını yaradır
export const generateMockDashboardData = (role: string): DashboardData => {
  const stats: StatsItem[] = [
    {
      id: '1',
      title: 'Ümumi Məktəblər',
      value: 650,
      change: 5,
      changeType: 'increase',
      icon: 'Building'
    },
    {
      id: '2',
      title: 'Tamamlanma dərəcəsi',
      value: '76%',
      change: 2.5,
      changeType: 'increase',
      icon: 'CheckCircle'
    },
    {
      id: '3',
      title: 'Gözləyən təsdiqləmə',
      value: 42,
      change: -8,
      changeType: 'decrease',
      icon: 'Clock'
    },
    {
      id: '4',
      title: 'Son 24 saat aktivlik',
      value: 128,
      change: 12,
      changeType: 'increase',
      icon: 'Activity'
    }
  ];

  const notifications: DashboardNotification[] = [
    {
      id: '1',
      title: 'Yeni kateqoriya',
      message: 'Əsas məktəb məlumatları kateqoriyası əlavə edildi',
      time: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      type: 'info',
      read: false
    },
    {
      id: '2',
      title: 'Təcili bildiriş',
      message: '5 məktəbin məlumatları təsdiq üçün gözləyir',
      time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      type: 'warning',
      read: false
    },
    {
      id: '3',
      title: 'Sistem yeniləməsi',
      message: 'InfoLine sistemi v2.1 versiyasına yeniləndi',
      time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      type: 'info',
      read: true
    },
    {
      id: '4',
      title: 'Son tarix xəbərdarlığı',
      message: 'Müəllim məlumatları kateqoriyası üçün son tarixə 2 gün qalıb',
      time: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      type: 'error',
      read: false
    }
  ];

  const recentForms: FormItem[] = [
    {
      id: '1',
      title: 'Əsas məktəb məlumatları',
      category: 'Məktəb məlumatları',
      status: 'approved',
      completionPercentage: 100
    },
    {
      id: '2',
      title: 'Müəllim statistikası',
      category: 'Kadr məlumatları',
      status: 'pending',
      completionPercentage: 75,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString()
    },
    {
      id: '3',
      title: 'İnfrastruktur məlumatları',
      category: 'Maddi baza',
      status: 'rejected',
      completionPercentage: 60
    }
  ];

  // Role-a görə müxtəlif data döndəriririk
  switch (role.toLowerCase()) {
    case 'superadmin':
      const superAdminData: SuperAdminDashboardData = {
        regions: 12,
        sectors: 42,
        schools: 650,
        users: 800,
        completionRate: 76,
        pendingApprovals: 42,
        pendingSchools: 120,
        approvedSchools: 450,
        rejectedSchools: 80,
        notifications,
        stats,
        recentForms,
        topSchools: [
          { id: '1', name: 'Bakı şəhəri 6 nömrəli məktəb', completionPercentage: 98, region: 'Bakı' },
          { id: '2', name: 'Sumqayıt şəhəri 2 nömrəli məktəb', completionPercentage: 96, region: 'Sumqayıt' },
          { id: '3', name: 'Şəki şəhəri 7 nömrəli məktəb', completionPercentage: 94, region: 'Şəki' },
          { id: '4', name: 'Gəncə şəhəri 3 nömrəli məktəb', completionPercentage: 92, region: 'Gəncə' },
          { id: '5', name: 'Naxçıvan şəhəri 5 nömrəli məktəb', completionPercentage: 90, region: 'Naxçıvan' }
        ]
      };
      return superAdminData;
      
    case 'regionadmin':
      const regionAdminData: RegionAdminDashboardData = {
        sectors: 10,
        schools: 120,
        users: 200,
        completionRate: 72,
        pendingApprovals: 18,
        pendingSchools: 40,
        approvedSchools: 75,
        rejectedSchools: 5,
        notifications,
        stats,
        recentForms,
        sectorCompletions: [
          { id: '1', name: 'Nəsimi rayonu', schoolCount: 25, completionPercentage: 85 },
          { id: '2', name: 'Nərimanov rayonu', schoolCount: 22, completionPercentage: 78 },
          { id: '3', name: 'Yasamal rayonu', schoolCount: 18, completionPercentage: 92 },
          { id: '4', name: 'Nizami rayonu', schoolCount: 20, completionPercentage: 65 },
          { id: '5', name: 'Xətai rayonu', schoolCount: 15, completionPercentage: 70 }
        ],
        categories: [
          { id: '1', name: 'Əsas məktəb məlumatları', completionPercentage: 96, status: 'active' },
          { id: '2', name: 'Müəllim statistikası', completionPercentage: 78, status: 'active', deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString() },
          { id: '3', name: 'Şagird məlumatları', completionPercentage: 62, status: 'active', deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString() },
          { id: '4', name: 'İnfrastruktur', completionPercentage: 85, status: 'active' }
        ]
      };
      return regionAdminData;
      
    case 'sectoradmin':
      const sectorAdminData: SectorAdminDashboardData = {
        schools: 25,
        completionRate: 68,
        pendingApprovals: 12,
        pendingSchools: 8,
        approvedSchools: 15,
        rejectedSchools: 2,
        notifications,
        stats,
        recentForms,
        schoolList: [
          { id: '1', name: '6 nömrəli məktəb', completionPercentage: 95 },
          { id: '2', name: '12 nömrəli məktəb', completionPercentage: 87 },
          { id: '3', name: '25 nömrəli məktəb', completionPercentage: 72 },
          { id: '4', name: '34 nömrəli məktəb', completionPercentage: 58 },
          { id: '5', name: '42 nömrəli məktəb', completionPercentage: 43 }
        ]
      };
      return sectorAdminData;
      
    case 'schooladmin':
      const schoolAdminData: SchoolAdminDashboardData = {
        forms: {
          pending: 3,
          approved: 8,
          rejected: 1,
          dueSoon: 2,
          overdue: 0
        },
        completionRate: 75,
        categories: 6,
        totalForms: 12,
        notifications,
        stats,
        pendingForms: [
          {
            id: '1',
            title: 'Müəllim statistikası',
            category: 'Kadr məlumatları',
            status: 'pending',
            completionPercentage: 75,
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString()
          },
          {
            id: '2',
            title: 'Şagird məlumatları',
            category: 'Şagirdlər',
            status: 'pending',
            completionPercentage: 60,
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString()
          },
          {
            id: '3',
            title: 'İnfrastruktur məlumatları',
            category: 'Maddi baza',
            status: 'pending',
            completionPercentage: 30,
            deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString()
          }
        ],
        recentForms,
        completedCategories: [
          { id: '1', name: 'Əsas məktəb məlumatları', completionPercentage: 100, status: 'approved' },
          { id: '2', name: 'Müəllim statistikası', completionPercentage: 75, status: 'pending', deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString() }
        ]
      };
      return schoolAdminData;
      
    default:
      return {
        regions: 0,
        sectors: 0,
        schools: 0,
        users: 0,
        completionRate: 0,
        pendingApprovals: 0,
        notifications: [],
        stats: []
      } as SuperAdminDashboardData;
  }
};

// Chart data generatoru - qrafiklər üçün məlumat yaradır
export const generateMockChartData = (): ChartData => {
  return {
    activityData: [
      { name: 'B.e.', value: 24 },
      { name: 'C.a.', value: 18 },
      { name: 'Ç.a.', value: 32 },
      { name: 'C.', value: 42 },
      { name: 'Ş.', value: 37 },
      { name: 'B.', value: 12 },
      { name: 'B.', value: 8 }
    ],
    regionSchoolsData: [
      { name: 'Bakı', value: 210 },
      { name: 'Sumqayıt', value: 85 },
      { name: 'Gəncə', value: 72 },
      { name: 'Şəki', value: 48 },
      { name: 'Mingəçevir', value: 35 },
      { name: 'Digər', value: 200 }
    ],
    categoryCompletionData: [
      { name: 'Məktəb məlumatları', completed: 92 },
      { name: 'Müəllim statistikası', completed: 78 },
      { name: 'Şagird məlumatları', completed: 65 },
      { name: 'İnfrastruktur', completed: 86 },
      { name: 'Maddi-texniki baza', completed: 72 }
    ]
  };
};

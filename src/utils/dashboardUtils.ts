
import { SchoolAdminDashboardData, DashboardData, ChartData } from '@/types/dashboard';

/**
 * İstifadəçi roluna görə dashboard məlumatları yaradır
 * @param role İstifadəçi rolu
 * @returns Dashboard məlumatları
 */
export function generateDashboardDataByRole(role?: string): DashboardData {
  // Default data
  const defaultData: DashboardData = {
    statistics: {
      schools: 478,
      sectors: 23,
      regions: 12,
      users: 567,
      categories: 8,
      forms: 42
    },
    recentActivities: [
      { id: '1', type: 'created', user: 'Admin', entity: 'School', date: new Date().toISOString(), details: 'Yeni məktəb yaradıldı' },
      { id: '2', type: 'updated', user: 'Region admin', entity: 'Sector', date: new Date().toISOString(), details: 'Sektor yeniləndi' },
      { id: '3', type: 'deleted', user: 'Superadmin', entity: 'Category', date: new Date().toISOString(), details: 'Kateqoriya silindi' },
    ],
    pendingApprovals: [
      { id: '1', school: 'Məktəb 1', category: 'Təhsil statistikası', date: new Date().toISOString(), status: 'pending' },
      { id: '2', school: 'Məktəb 2', category: 'Maliyyə hesabatı', date: new Date().toISOString(), status: 'pending' },
    ],
    chartData: {
      completionByCategory: [
        { name: 'Təhsil', value: 85 },
        { name: 'Maliyyə', value: 67 },
        { name: 'İnfrastruktur', value: 92 },
      ],
      schoolsByRegion: [
        { name: 'Bakı', value: 124 },
        { name: 'Sumqayıt', value: 45 },
        { name: 'Gəncə', value: 36 },
      ]
    }
  };

  // Rola görə məlumatları fərdiləşdirmək
  switch (role) {
    case 'superadmin':
      return {
        ...defaultData,
        statistics: {
          ...defaultData.statistics,
          schools: 478,
          sectors: 23,
          regions: 12,
          users: 567
        }
      };
    case 'regionadmin':
      return {
        ...defaultData,
        statistics: {
          ...defaultData.statistics,
          schools: 86,
          sectors: 4,
          users: 124
        }
      };
    case 'sectoradmin':
      return {
        ...defaultData,
        statistics: {
          ...defaultData.statistics,
          schools: 24,
          users: 42
        }
      };
    default:
      return defaultData;
  }
}

/**
 * Dashboard qrafikləri üçün mock məlumatlar yaradır
 */
export function createMockChartData(): ChartData {
  return {
    activityData: [
      { name: 'Form Təqdimi', value: 42 },
      { name: 'Təsdiqlər', value: 28 },
      { name: 'Yeni İstifadəçilər', value: 15 },
    ],
    regionSchoolsData: [
      { name: 'Bakı', value: 124 },
      { name: 'Sumqayıt', value: 45 },
      { name: 'Gəncə', value: 36 },
      { name: 'Lənkəran', value: 28 },
      { name: 'Şəki', value: 22 },
    ],
    categoryCompletionData: [
      { name: 'Təhsil Statistikası', completed: 85 },
      { name: 'Maliyyə Hesabatı', completed: 67 },
      { name: 'İnfrastruktur', completed: 92 },
      { name: 'İnsan Resursları', completed: 78 },
      { name: 'Layihələr', completed: 45 },
    ]
  };
}

/**
 * SchoolAdmin dashboard üçün mock məlumat yaradır
 */
export function createMockSchoolAdminData(): SchoolAdminDashboardData {
  return {
    forms: {
      pending: 3,
      approved: 8,
      rejected: 1,
      dueSoon: 2,
      overdue: 0,
      total: 14
    },
    completionRate: 78,
    notifications: [
      {
        id: '1',
        title: 'Yeni kateqoriya əlavə edildi',
        message: 'Maliyyə Hesabatı kateqoriyası əlavə edildi',
        type: 'category',
        date: '2025-04-15',
        time: '10:30',
        isRead: false,
        userId: 'user-1',
        priority: 'normal',
      },
      {
        id: '2',
        title: 'Son tarix xəbərdarlığı',
        message: 'Təhsil Statistikası formu üçün son tarix yaxınlaşır',
        type: 'deadline',
        date: '2025-04-14',
        time: '15:45',
        isRead: true,
        userId: 'user-1',
        priority: 'high',
      },
    ],
    pendingForms: [
      {
        id: '1',
        title: 'Təhsil Statistikası',
        category: 'Təhsil',
        date: '2025-04-25',
        status: 'pending',
        completionPercentage: 85
      },
      {
        id: '2',
        title: 'Maliyyə Hesabatı',
        category: 'Maliyyə',
        date: '2025-04-30',
        status: 'dueSoon',
        completionPercentage: 35
      },
      {
        id: '3',
        title: 'İnfrastruktur Qiymətləndirməsi',
        category: 'İnfrastruktur',
        date: '2025-05-10',
        status: 'pending',
        completionPercentage: 60
      }
    ]
  };
}


import { 
  SuperAdminDashboardData, 
  RegionAdminDashboardData, 
  SectorAdminDashboardData, 
  SchoolAdminDashboardData,
  ChartData
} from '@/types/dashboard';
import { UserRole } from '@/types/user';

/**
 * Rola görə dashboard məlumatlarını generasiya edən funksiya
 */
export function generateDashboardDataByRole(role: UserRole): any {
  switch (role) {
    case 'superadmin':
      return {
        regions: 15,
        sectors: 45,
        schools: 640,
        users: 780,
        completionRate: 72,
        pendingApprovals: 24,
        notifications: [
          {
            id: '1',
            type: 'info',
            title: 'Sistem yeniləndi',
            message: 'Sistem v1.2 versiyasına yeniləndi',
            isRead: false,
            createdAt: '2025-04-14T10:00:00Z',
            userId: '1',
            priority: 'normal',
            date: '2025-04-14',
            time: '10:00'
          },
          {
            id: '2',
            type: 'warning',
            title: 'Məlumat daxiletmə müddətinə az qalır',
            message: 'Şagird statistikası kateqoriyası üçün məlumat daxiletmə müddətinə 3 gün qalır',
            isRead: false,
            createdAt: '2025-04-14T10:30:00Z',
            userId: '1',
            priority: 'high',
            date: '2025-04-14',
            time: '10:30'
          }
        ]
      } as SuperAdminDashboardData;
      
    case 'regionadmin':
      return {
        sectors: 5,
        schools: 120,
        users: 150,
        completionRate: 68,
        pendingApprovals: 12,
        notifications: [
          {
            id: '1',
            type: 'info',
            title: 'Yeni məktəb əlavə edildi',
            message: 'Regionunuza yeni məktəb əlavə edildi',
            isRead: false,
            createdAt: '2025-04-14T09:00:00Z',
            userId: '2',
            priority: 'normal',
            date: '2025-04-14',
            time: '09:00'
          }
        ]
      } as RegionAdminDashboardData;
      
    case 'sectoradmin':
      return {
        schools: 12,
        completionRate: 75,
        pendingApprovals: 8,
        notifications: [
          {
            id: '1',
            type: 'warning',
            title: 'Məlumat daxil edilməyib',
            message: '3 məktəb hələ məlumat daxil etməyib',
            isRead: false,
            createdAt: '2025-04-14T11:00:00Z',
            userId: '3',
            priority: 'high',
            date: '2025-04-14',
            time: '11:00'
          }
        ]
      } as SectorAdminDashboardData;
      
    case 'schooladmin':
      return createMockSchoolAdminData();
      
    default:
      return {};
  }
}

/**
 * School admin üçün mock data generasiya edən funksiya
 */
export function createMockSchoolAdminData(): SchoolAdminDashboardData {
  return {
    forms: {
      pending: 3,
      approved: 5,
      rejected: 1,
      total: 9,
      dueSoon: 2,
      overdue: 0
    },
    completionRate: 65,
    notifications: [
      {
        id: '1',
        type: 'info',
        title: 'Məlumatlar təsdiqləndi',
        message: 'Şagird statistikası kateqoriyasında daxil etdiyiniz məlumatlar təsdiqləndi',
        isRead: false,
        createdAt: '2025-04-14T14:00:00Z',
        userId: '4',
        priority: 'normal',
        date: '2025-04-14',
        time: '14:00'
      }
    ],
    pendingForms: [
      {
        id: 'form1',
        title: 'Şagird Statistikası',
        dueDate: '2025-04-30',
        status: 'pending',
        completionPercentage: 75
      },
      {
        id: 'form2',
        title: 'Müəllim heyəti',
        dueDate: '2025-05-15',
        status: 'pending',
        completionPercentage: 50
      }
    ]
  };
}

/**
 * Chart data generasiya edən funksiya
 */
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

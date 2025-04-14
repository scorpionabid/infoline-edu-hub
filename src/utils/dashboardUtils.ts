
import { 
  SuperAdminDashboardData, 
  RegionAdminDashboardData, 
  SectorAdminDashboardData, 
  SchoolAdminDashboardData, 
  DashboardNotification,
  ChartData,
  FormItem
} from '@/types/dashboard';
import { Notification } from '@/types/notification';

/**
 * Bildirim tipini DashboardNotification tipinə çevirir
 */
export function convertToDashboardNotification(notification: Notification): DashboardNotification {
  return {
    ...notification,
    date: notification.time || notification.createdAt || new Date().toISOString()
  };
}

/**
 * SuperAdmin üçün mock dashboard məlumatları yaradır
 */
export function createMockSuperAdminData(): SuperAdminDashboardData {
  const mockNotifications = createMockNotifications(5);
  const dashboardNotifications = mockNotifications.map(convertToDashboardNotification);
  
  return {
    regions: 12,
    sectors: 48,
    schools: 645,
    users: 872,
    completionRate: 76,
    pendingApprovals: 34,
    notifications: dashboardNotifications,
    stats: [
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
    ],
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
}

/**
 * RegionAdmin üçün mock dashboard məlumatları yaradır
 */
export function createMockRegionAdminData(): RegionAdminDashboardData {
  const mockNotifications = createMockNotifications(5);
  const dashboardNotifications = mockNotifications.map(convertToDashboardNotification);
  
  return {
    sectors: 8,
    schools: 120,
    users: 145,
    completionRate: 72,
    pendingApprovals: 18,
    pendingSchools: 12,
    approvedSchools: 98,
    rejectedSchools: 10,
    notifications: dashboardNotifications,
    stats: [
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
    ],
    categories: [
      {
        name: 'Şagird statistikası',
        completionRate: 85,
        color: '#4ade80',
        id: '1'
      },
      {
        name: 'Müəllim heyəti',
        completionRate: 72,
        color: '#facc15',
        id: '2'
      }
    ],
    sectorCompletions: [
      {
        name: 'Nərimanov',
        completionRate: 85,
        id: '1',
        schoolCount: 24
      },
      {
        name: 'Nəsimi',
        completionRate: 72,
        id: '2',
        schoolCount: 18
      },
      {
        name: 'Yasamal',
        completionRate: 68,
        id: '3',
        schoolCount: 22
      }
    ]
  };
}

/**
 * SectorAdmin üçün mock dashboard məlumatları yaradır
 */
export function createMockSectorAdminData(): SectorAdminDashboardData {
  const mockNotifications = createMockNotifications(5);
  const dashboardNotifications = mockNotifications.map(convertToDashboardNotification);
  
  return {
    schools: 24,
    completionRate: 68,
    pendingApprovals: 12,
    pendingSchools: 8,
    approvedSchools: 14,
    rejectedSchools: 2,
    notifications: dashboardNotifications,
    stats: [
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
    ],
    schoolStats: [
      {
        id: '1',
        name: '20 nömrəli məktəb',
        completionRate: 85,
        pending: 2
      },
      {
        id: '2',
        name: '45 nömrəli məktəb',
        completionRate: 72,
        pending: 3
      },
      {
        id: '3',
        name: '67 nömrəli məktəb',
        completionRate: 68,
        pending: 1
      }
    ],
    pendingItems: [
      {
        id: '1',
        school: '20 nömrəli məktəb',
        category: 'Şagird statistikası',
        date: '2024-04-15'
      },
      {
        id: '2',
        school: '45 nömrəli məktəb',
        category: 'Müəllim heyəti',
        date: '2024-04-20'
      }
    ],
    categoryCompletion: [
      {
        name: 'Şagird statistikası',
        completionRate: 85,
        color: '#4ade80',
        id: '1'
      },
      {
        name: 'Müəllim heyəti',
        completionRate: 72,
        color: '#facc15',
        id: '2'
      }
    ],
    activityLog: [
      {
        id: '1',
        action: 'Məlumat əlavə edildi',
        target: 'Şagird statistikası',
        time: '10:30'
      },
      {
        id: '2',
        action: 'Məlumat təsdiqləndi',
        target: 'Müəllim heyəti',
        time: '14:45'
      }
    ]
  };
}

/**
 * SchoolAdmin üçün mock dashboard məlumatları yaradır
 */
export function createMockSchoolAdminData(): SchoolAdminDashboardData {
  const mockNotifications = createMockNotifications(5);
  const dashboardNotifications = mockNotifications.map(convertToDashboardNotification);

  return {
    forms: {
      pending: 5,
      approved: 12,
      rejected: 2,
      total: 19,
      dueSoon: 3,
      overdue: 1
    },
    completionRate: 63,
    notifications: dashboardNotifications,
    pendingForms: [
      {
        id: '1',
        title: 'Şagird statistikası',
        category: 'İllik',
        status: 'pending',
        completionPercentage: 45,
        date: '2024-04-15'
      },
      {
        id: '2',
        title: 'Müəllim heyəti',
        category: 'Rüblük',
        status: 'pending',
        completionPercentage: 20,
        date: '2024-04-20'
      },
      {
        id: '3',
        title: 'İnfrastruktur',
        category: 'İllik',
        status: 'pending',
        completionPercentage: 10,
        date: '2024-05-10'
      },
      {
        id: '4',
        title: 'Tədris proqramı',
        category: 'Rüblük',
        status: 'dueSoon',
        completionPercentage: 80,
        date: '2024-04-10'
      },
      {
        id: '5',
        title: 'İnzibati işlər',
        category: 'Aylıq',
        status: 'overdue',
        completionPercentage: 60,
        date: '2024-04-01'
      }
    ]
  };
}

/**
 * Mock bildirişlər yaradır
 * @param count Yaradılacaq bildiriş sayı
 */
export function createMockNotifications(count: number): Notification[] {
  const notifications: Notification[] = [];
  
  const types = ['info', 'warning', 'success', 'error'] as const;
  const titles = [
    'Yeni kateqoriya əlavə edildi',
    'Məlumat daxil etmə vaxtı yaxınlaşır',
    'Məlumatlar təsdiqləndi',
    'Məlumat rədd edildi',
    'Sistem yeniləndi'
  ];
  
  const messages = [
    'Şagird statistikası kateqoriyası əlavə edildi',
    'Müəllim heyəti məlumatlarını daxil etmək üçün 3 gün qalıb',
    'İnfrastruktur məlumatları uğurla təsdiqləndi',
    'Tədris proqramı məlumatları natamam olduğu üçün rədd edildi',
    'Sistem yeni funksionallıqlarla yeniləndi'
  ];
  
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    notifications.push({
      id: `notif-${i}`,
      type: types[i % types.length],
      title: titles[i % titles.length],
      message: messages[i % messages.length],
      isRead: i > 2,
      createdAt: date.toISOString(),
      userId: 'user-1',
      priority: i % 3 === 0 ? 'high' : 'normal',
      time: date.toISOString(),
      date: date.toISOString()
    });
  }
  
  return notifications;
}

/**
 * Mock qrafik məlumatları yaradır
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


import { 
  SuperAdminDashboardData, 
  RegionAdminDashboardData,
  SectorAdminDashboardData,
  SchoolAdminDashboardData,
  DashboardNotification,
  FormItem,
  ChartData
} from '@/hooks/useDashboardData';

// Dashboard mock məlumatları yaradan funksiya
export function generateMockDashboardData(
  role: string
): SuperAdminDashboardData | RegionAdminDashboardData | SectorAdminDashboardData | SchoolAdminDashboardData {
  // Test bildirişləri
  const mockNotifications: DashboardNotification[] = [
    {
      id: '1',
      title: 'Yeni kateqoriya əlavə edildi',
      message: 'Sistem administratoru tərəfindən yeni kateqoriya əlavə edildi',
      time: new Date().toISOString(),
      type: 'info',
      read: false
    },
    {
      id: '2',
      title: 'Son tarix dəyişdirildi',
      message: 'Şagird statistikası kateqoriyasının son tarixi dəyişdirildi',
      time: new Date(Date.now() - 86400000).toISOString(),
      type: 'warning',
      read: true
    },
    {
      id: '3',
      title: 'Məlumatlar təsdiqləndi',
      message: 'Müəllim məlumatları kateqoriyası təsdiqləndi',
      time: new Date(Date.now() - 172800000).toISOString(),
      type: 'success',
      read: false
    },
    {
      id: '4',
      title: 'Məlumatlar rədd edildi',
      message: 'Maddi-texniki baza məlumatlarında düzəlişlər tələb olunur',
      time: new Date(Date.now() - 259200000).toISOString(),
      type: 'error',
      read: false
    }
  ];

  // İstifadəçi roluna görə uyğun məlumatlar yaradılır
  switch (role) {
    case 'superadmin':
      return {
        regions: 12,
        sectors: 48,
        schools: 615,
        users: 1842,
        completionRate: 78,
        pendingApprovals: 24,
        notifications: mockNotifications,
        activityData: [
          {
            id: '1',
            action: 'Kateqoriya əlavə edildi',
            actor: 'Admin',
            target: 'Şagird statistikası',
            time: new Date().toISOString()
          },
          {
            id: '2',
            action: 'Məktəb əlavə edildi',
            actor: 'Region Admin',
            target: '25 nömrəli məktəb',
            time: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '3',
            action: 'İstifadəçi əlavə edildi',
            actor: 'Admin',
            target: 'Yeni Sektor Admini',
            time: new Date(Date.now() - 172800000).toISOString()
          }
        ],
        pendingSchools: 45,
        approvedSchools: 523,
        rejectedSchools: 47,
        stats: [
          {
            id: 'regions',
            title: 'Regionlar',
            value: 12,
            change: 2,
            changeType: 'increase'
          },
          {
            id: 'sectors',
            title: 'Sektorlar',
            value: 48,
            change: 3,
            changeType: 'increase'
          },
          {
            id: 'schools',
            title: 'Məktəblər',
            value: 615,
            change: 15,
            changeType: 'increase'
          },
          {
            id: 'users',
            title: 'İstifadəçilər',
            value: 1842,
            change: 32,
            changeType: 'increase'
          }
        ],
        recentForms: generateMockFormItems(5)
      };

    case 'regionadmin':
      return {
        sectors: 8,
        schools: 125,
        users: 245,
        completionRate: 72,
        pendingApprovals: 18,
        pendingSchools: 23,
        approvedSchools: 89,
        rejectedSchools: 13,
        notifications: mockNotifications.slice(1),
        categories: [
          {
            id: '1',
            name: 'Əsas məlumatlar',
            completionPercentage: 92,
            deadline: new Date(Date.now() + 604800000).toISOString(),
            status: 'active'
          },
          {
            id: '2',
            name: 'Müəllim məlumatları',
            completionPercentage: 78,
            deadline: new Date(Date.now() + 1209600000).toISOString(),
            status: 'active'
          },
          {
            id: '3',
            name: 'Şagird məlumatları',
            completionPercentage: 85,
            deadline: new Date(Date.now() + 1814400000).toISOString(),
            status: 'active'
          }
        ],
        sectorCompletions: [
          {
            id: '1',
            name: 'Şəhər mərkəzi',
            schoolCount: 25,
            completionPercentage: 89
          },
          {
            id: '2',
            name: 'Şəhər ətrafı',
            schoolCount: 35,
            completionPercentage: 72
          },
          {
            id: '3',
            name: 'Kənd məktəbləri',
            schoolCount: 65,
            completionPercentage: 65
          }
        ],
        stats: [
          {
            id: 'sectors',
            title: 'Sektorlar',
            value: 8,
            change: 0,
            changeType: 'neutral'
          },
          {
            id: 'schools',
            title: 'Məktəblər',
            value: 125,
            change: 5,
            changeType: 'increase'
          },
          {
            id: 'users',
            title: 'İstifadəçilər',
            value: 245,
            change: 12,
            changeType: 'increase'
          },
          {
            id: 'pendingApprovals',
            title: 'Təsdiq gözləyən',
            value: 18,
            change: -3,
            changeType: 'decrease'
          }
        ],
        recentForms: generateMockFormItems(4)
      };

    case 'sectoradmin':
      return {
        schools: 35,
        completionRate: 83,
        pendingApprovals: 8,
        pendingSchools: 12,
        approvedSchools: 20,
        rejectedSchools: 3,
        notifications: mockNotifications.filter(n => n.id !== '4'),
        stats: [
          {
            id: 'schools',
            title: 'Məktəblər',
            value: 35,
            change: 0,
            changeType: 'neutral'
          },
          {
            id: 'completionRate',
            title: 'Tamamlanma faizi',
            value: '83%',
            change: 5,
            changeType: 'increase'
          },
          {
            id: 'pendingApprovals',
            title: 'Təsdiq gözləyən',
            value: 8,
            change: -2,
            changeType: 'decrease'
          },
          {
            id: 'approvedSchools',
            title: 'Təsdiqlənən məktəblər',
            value: 20,
            change: 3,
            changeType: 'increase'
          }
        ],
        recentForms: generateMockFormItems(4),
        schoolList: [
          {
            id: '1',
            name: '5 nömrəli məktəb',
            completionPercentage: 95
          },
          {
            id: '2',
            name: '12 nömrəli məktəb',
            completionPercentage: 87
          },
          {
            id: '3',
            name: '23 nömrəli məktəb',
            completionPercentage: 76
          },
          {
            id: '4',
            name: '31 nömrəli məktəb',
            completionPercentage: 92
          },
          {
            id: '5',
            name: '42 nömrəli məktəb',
            completionPercentage: 64
          }
        ]
      };

    default:
      // SchoolAdmin default
      return {
        forms: {
          pending: 3,
          approved: 12,
          rejected: 1,
          dueSoon: 2,
          overdue: 0
        },
        completionRate: 75,
        notifications: mockNotifications.filter(n => n.id !== '1'),
        categories: 6,
        totalForms: 18,
        pendingForms: generateMockFormItems(3),
        stats: [
          {
            id: 'completionRate',
            title: 'Tamamlanma faizi',
            value: '75%',
            change: 8,
            changeType: 'increase'
          },
          {
            id: 'pendingForms',
            title: 'Gözləmədə olan formalar',
            value: 3,
            change: -1,
            changeType: 'decrease'
          },
          {
            id: 'approvedForms',
            title: 'Təsdiqlənmiş formalar',
            value: 12,
            change: 4,
            changeType: 'increase'
          },
          {
            id: 'dueSoonForms',
            title: 'Yaxınlaşan son tarixlər',
            value: 2,
            change: 0,
            changeType: 'neutral'
          }
        ],
        recentForms: generateMockFormItems(5),
        dueDates: [
          {
            category: 'Şagird statistikası',
            date: new Date(Date.now() + 604800000).toISOString()
          },
          {
            category: 'Müəllim məlumatları',
            date: new Date(Date.now() + 1209600000).toISOString()
          },
          {
            category: 'Maliyyə hesabatları',
            date: new Date(Date.now() + 1814400000).toISOString()
          }
        ]
      };
  }
}

// Mock form elementləri yaratmaq üçün köməkçi funksiya
function generateMockFormItems(count: number): FormItem[] {
  const statuses = ['approved', 'pending', 'rejected', 'dueSoon', 'overdue'];
  const categories = [
    'Əsas məktəb məlumatları',
    'Müəllim statistikası',
    'Şagird məlumatları',
    'İnfrastruktur',
    'Maddi-texniki baza'
  ];

  return Array.from({ length: count }).map((_, index) => ({
    id: `form-${index + 1}`,
    title: `Form ${index + 1}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    completionPercentage: Math.floor(Math.random() * 100),
    deadline: new Date(Date.now() + Math.floor(Math.random() * 2592000000)).toISOString()
  }));
}

// Chart məlumatları yaratmaq üçün funksiya
export function generateMockChartData(): ChartData {
  return {
    activityData: [
      { name: 'Yan', value: 20 },
      { name: 'Fev', value: 45 },
      { name: 'Mar', value: 28 },
      { name: 'Apr', value: 80 },
      { name: 'May', value: 99 },
      { name: 'İyn', value: 43 },
      { name: 'İyl', value: 50 },
    ],
    regionSchoolsData: [
      { name: 'Bakı', value: 120 },
      { name: 'Sumqayıt', value: 75 },
      { name: 'Gəncə', value: 65 },
      { name: 'Lənkəran', value: 45 },
      { name: 'Şəki', value: 30 },
    ],
    categoryCompletionData: [
      { name: 'Ümumi məlumat', completed: 78 },
      { name: 'Müəllim heyəti', completed: 65 },
      { name: 'Texniki baza', completed: 82 },
      { name: 'Maliyyə', completed: 59 },
      { name: 'Tədris planı', completed: 91 },
    ]
  };
}

// DashboardNotification tipini Notification tipinə çevirmək üçün adapter funksiya
export function adaptDashboardNotificationToNotification(notification: DashboardNotification) {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    time: notification.time,
    isRead: notification.read || false,
    createdAt: notification.time,
    priority: 'normal' as const
  };
}

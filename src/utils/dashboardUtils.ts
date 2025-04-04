
import { DashboardData, SuperAdminDashboardData, RegionAdminDashboardData, SectorAdminDashboardData, SchoolAdminDashboardData, StatsItem, CategoryCompletion, ChartData } from '@/hooks/useDashboardData';
import { DashboardNotification, Notification, NotificationType } from '@/types/notification';

// Dashboard verilərini adaptasiya etmək üçün utility funksiyaları

// DashboardNotification-dan Notification-a adaptasiya
export const adaptNotifications = (dashboardNotifications: DashboardNotification[]): Notification[] => {
  return dashboardNotifications.map(notification => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type as NotificationType,
    time: notification.time,
    isRead: notification.read || false,
    createdAt: notification.time || new Date().toISOString(),
    priority: 'normal'
  }));
};

// Mock qrafik məlumatlarını yaratmaq üçün funksiya
export function generateMockChartData(): ChartData {
  // Aktivlik məlumatları
  const activityData = [
    { name: 'Yan', value: 20 },
    { name: 'Fev', value: 45 },
    { name: 'Mar', value: 28 },
    { name: 'Apr', value: 80 },
    { name: 'May', value: 99 },
    { name: 'İyn', value: 43 },
    { name: 'İyl', value: 50 },
  ];
  
  // Region məktəb sayı məlumatları
  const regionSchoolsData = [
    { name: 'Bakı', value: 120 },
    { name: 'Sumqayıt', value: 75 },
    { name: 'Gəncə', value: 65 },
    { name: 'Lənkəran', value: 45 },
    { name: 'Şəki', value: 30 },
  ];
  
  // Kateqoriya tamamlanma faizi məlumatları
  const categoryCompletionData = [
    { name: 'Ümumi məlumat', completed: 78 },
    { name: 'Müəllim heyəti', completed: 65 },
    { name: 'Texniki baza', completed: 82 },
    { name: 'Maliyyə', completed: 59 },
    { name: 'Tədris planı', completed: 91 },
  ];
  
  return {
    activityData,
    regionSchoolsData,
    categoryCompletionData
  };
}

// SuperAdmin dashboard verilərini generasiya et
export function generateSuperAdminDashboardData(): SuperAdminDashboardData {
  // Bildirişlər
  const notificationsData: DashboardNotification[] = [
    { 
      id: '1', 
      title: 'Yeni kateqoriya yaradıldı', 
      message: 'Təhsil statistikası kateqoriyası yaradıldı.', 
      type: 'category',
      time: '2023-07-07T09:30:00Z' 
    },
    { 
      id: '2', 
      title: 'Yaxınlaşan son tarix', 
      message: 'Şagird məlumatları kateqoriyasında son tarixə 3 gün qalıb.', 
      type: 'deadline',
      time: '2023-07-06T14:15:00Z' 
    },
    { 
      id: '3', 
      title: 'Təsdiq tələbi', 
      message: 'Bakı, Məktəb #5-dən göndərilən məlumatlar təsdiq gözləyir.', 
      type: 'approval',
      time: '2023-07-05T11:45:00Z' 
    },
    { 
      id: '4', 
      title: 'Sistem yenilənməsi', 
      message: 'Sistem yeniləndi. Yeni xüsusiyyətlər əlavə edildi.', 
      type: 'system',
      time: '2023-07-04T08:20:00Z', 
      read: true 
    },
  ];

  // Məlumat toplama aktivliyi
  const activityData = [
    { id: '1', action: 'Məlumat daxil edildi', actor: 'Anar Məmmədov', target: 'Şagird məlumatları', time: '2023-07-07T14:30:00Z' },
    { id: '2', action: 'Kateqoriya yaradıldı', actor: 'Leyla Əliyeva', target: 'Təhsil statistikası', time: '2023-07-07T10:15:00Z' },
    { id: '3', action: 'Məlumat təsdiqləndi', actor: 'Elşən Hüseynov', target: 'Müəllim məlumatları', time: '2023-07-06T16:45:00Z' },
    { id: '4', action: 'Məlumat rədd edildi', actor: 'Səbinə Qasımova', target: 'İnfrastruktur', time: '2023-07-06T11:20:00Z' },
    { id: '5', action: 'İstifadəçi əlavə edildi', actor: 'Admin', target: 'Binəqədi sektoru', time: '2023-07-05T09:10:00Z' },
  ];

  // Dashboard verilərini hazırla
  return {
    regions: 10,
    sectors: 45,
    schools: 220,
    users: 350,
    completionRate: 70,
    pendingApprovals: 15,
    notifications: adaptNotifications(notificationsData),
    activityData: activityData,
    pendingSchools: 66,
    approvedSchools: 154,
    rejectedSchools: 0,
    stats: [
      { id: '1', title: 'Ümumi məktəblər', value: 220, icon: 'school' },
      { id: '2', title: 'Tamamlanmış məktəblər', value: 154, changeType: 'increase', change: 5, icon: 'check-circle' },
      { id: '3', title: 'Gözləyən məktəblər', value: 66, changeType: 'decrease', change: 2, icon: 'clock' },
      { id: '4', title: 'Tamamlanma faizi', value: '70%', changeType: 'increase', change: 3, icon: 'percent' }
    ]
  };
}

// RegionAdmin dashboard verilərini generasiya et
export function generateRegionAdminDashboardData(): RegionAdminDashboardData {
  // Bildirişlər
  const notificationsData: DashboardNotification[] = [
    { 
      id: '1', 
      title: 'Yeni kateqoriya yaradıldı', 
      message: 'Müəllim məlumatları kateqoriyası yaradıldı.', 
      type: 'category',
      time: '2023-07-07T09:30:00Z' 
    },
    { 
      id: '2', 
      title: 'Yaxınlaşan son tarix', 
      message: 'Şagird məlumatları kateqoriyasında son tarixə 3 gün qalıb.', 
      type: 'deadline',
      time: '2023-07-06T14:15:00Z' 
    },
    { 
      id: '3', 
      title: 'Təsdiq tələbi', 
      message: 'Binəqədi, Məktəb #12-dən göndərilən məlumatlar təsdiq gözləyir.', 
      type: 'approval',
      time: '2023-07-05T11:45:00Z' 
    },
  ];

  // Dashboard verilərini hazırla
  return {
    sectors: 5,
    schools: 120,
    users: 180,
    completionRate: 70,
    pendingApprovals: 8,
    pendingSchools: 36,
    approvedSchools: 84,
    rejectedSchools: 0,
    notifications: adaptNotifications(notificationsData),
    categories: [
      { id: '1', name: 'Təhsil statistikası', completionPercentage: 78, deadline: '2023-08-15', status: 'active' },
      { id: '2', name: 'Şagird məlumatları', completionPercentage: 64, deadline: '2023-08-20', status: 'active' },
      { id: '3', name: 'Müəllim məlumatları', completionPercentage: 82, deadline: '2023-08-10', status: 'active' }
    ],
    sectorCompletions: [
      { id: '1', name: 'Binəqədi', schoolCount: 35, completionPercentage: 82 },
      { id: '2', name: 'Sabunçu', schoolCount: 28, completionPercentage: 76 },
      { id: '3', name: 'Nəsimi', schoolCount: 32, completionPercentage: 68 },
      { id: '4', name: 'Yasamal', schoolCount: 25, completionPercentage: 64 }
    ],
    stats: [
      { id: '1', title: 'Ümumi məktəblər', value: 120, icon: 'school' },
      { id: '2', title: 'Tamamlanmış məktəblər', value: 84, changeType: 'increase', change: 3, icon: 'check-circle' },
      { id: '3', title: 'Gözləyən məktəblər', value: 36, changeType: 'decrease', change: 1, icon: 'clock' },
      { id: '4', title: 'Tamamlanma faizi', value: '70%', changeType: 'increase', change: 2, icon: 'percent' }
    ]
  };
}

// SectorAdmin dashboard verilərini generasiya et
export function generateSectorAdminDashboardData(): SectorAdminDashboardData {
  // Bildirişlər
  const notificationsData: DashboardNotification[] = [
    { 
      id: '1', 
      title: 'Məlumatlar təsdiqləndi', 
      message: 'Məktəb #10-un təqdim etdiyi məlumatlar təsdiqləndi.', 
      type: 'approval',
      time: '2023-07-07T09:30:00Z' 
    },
    { 
      id: '2', 
      title: 'Doldurulmamış məlumatlar', 
      message: 'Məktəb #31 hələ də Şagird məlumatları kateqoriyasını doldurmayıb.', 
      type: 'warning',
      time: '2023-07-06T14:15:00Z' 
    },
    { 
      id: '3', 
      title: 'Yeni məlumatlar gözləyir', 
      message: 'Məktəb #15-dən yeni təqdim edilən məlumatlar təsdiq gözləyir.', 
      type: 'info',
      time: '2023-07-05T11:45:00Z' 
    },
  ];

  // Dashboard verilərini hazırla
  return {
    schools: 35,
    completionRate: 63,
    pendingApprovals: 5,
    pendingSchools: 13,
    approvedSchools: 22,
    rejectedSchools: 0,
    notifications: adaptNotifications(notificationsData),
    schoolList: [
      { id: '1', name: 'Məktəb #10', completionPercentage: 88 },
      { id: '2', name: 'Məktəb #15', completionPercentage: 72 },
      { id: '3', name: 'Məktəb #22', completionPercentage: 64 },
      { id: '4', name: 'Məktəb #7', completionPercentage: 92 },
      { id: '5', name: 'Məktəb #31', completionPercentage: 36 }
    ],
    stats: [
      { id: '1', title: 'Ümumi məktəblər', value: 35, icon: 'school' },
      { id: '2', title: 'Tamamlanmış məktəblər', value: 22, changeType: 'increase', change: 2, icon: 'check-circle' },
      { id: '3', title: 'Gözləyən məktəblər', value: 13, changeType: 'neutral', change: 0, icon: 'clock' },
      { id: '4', title: 'Tamamlanma faizi', value: '63%', changeType: 'increase', change: 1, icon: 'percent' }
    ]
  };
}

// SchoolAdmin dashboard verilərini generasiya et
export function generateSchoolAdminDashboardData(): SchoolAdminDashboardData {
  // Bildirişlər
  const notificationsData: DashboardNotification[] = [
    { 
      id: '1', 
      title: 'Məlumatlar təsdiqləndi', 
      message: 'Təhsil statistikası kateqoriyasından təqdim etdiyiniz məlumatlar təsdiqləndi.', 
      type: 'success',
      time: '2023-07-07T09:30:00Z' 
    },
    { 
      id: '2', 
      title: 'Məlumatlar rədd edildi', 
      message: 'Müəllim məlumatları kateqoriyasından təqdim etdiyiniz məlumatlar rədd edildi.', 
      type: 'error',
      time: '2023-07-06T14:15:00Z' 
    },
    { 
      id: '3', 
      title: 'Son tarix yaxınlaşır', 
      message: 'İnfrastruktur kateqoriyasının son tarixi yaxınlaşır. Zəhmət olmasa, məlumatları tamamlayın.', 
      type: 'warning',
      time: '2023-07-05T11:45:00Z' 
    },
    { 
      id: '4', 
      title: 'Gecikmiş kateqoriya', 
      message: 'Tədris dili kateqoriyasının son tarixi keçib. Zəhmət olmasa, məlumatları təcili tamamlayın.', 
      type: 'error',
      time: '2023-07-04T08:20:00Z'
    },
  ];

  // Form məlumatları
  const formsData = {
    pending: 2,
    approved: 1,
    rejected: 1,
    dueSoon: 1,
    overdue: 1
  };

  // Pending formlar
  const pendingFormsData: any[] = [
    { 
      id: '2', 
      title: 'Şagird məlumatları', 
      category: 'Şagird məlumatları',
      status: 'pending',
      completionPercentage: 75,
      deadline: '2023-08-20'
    },
    { 
      id: '4', 
      title: 'İnfrastruktur', 
      category: 'İnfrastruktur',
      status: 'dueSoon',
      completionPercentage: 40,
      deadline: '2023-07-15'
    }
  ];

  // Recent formlar
  const recentFormsData = [
    { 
      id: '1', 
      title: 'Təhsil statistikası', 
      category: 'Təhsil statistikası',
      status: 'approved',
      completionPercentage: 100,
      deadline: '2023-08-15'
    },
    { 
      id: '2', 
      title: 'Şagird məlumatları', 
      category: 'Şagird məlumatları',
      status: 'pending',
      completionPercentage: 75,
      deadline: '2023-08-20'
    },
    { 
      id: '3', 
      title: 'Müəllim məlumatları', 
      category: 'Müəllim məlumatları',
      status: 'rejected',
      completionPercentage: 60,
      deadline: '2023-07-30'
    },
    { 
      id: '4', 
      title: 'İnfrastruktur', 
      category: 'İnfrastruktur',
      status: 'dueSoon',
      completionPercentage: 40,
      deadline: '2023-07-15'
    },
    { 
      id: '5', 
      title: 'Tədris dili', 
      category: 'Tədris dili',
      status: 'overdue',
      completionPercentage: 20,
      deadline: '2023-07-01'
    }
  ];

  // Dashboard verilərini hazırla
  return {
    forms: formsData,
    completionRate: 20,
    notifications: adaptNotifications(notificationsData),
    categories: 5,
    totalForms: 5,
    completedForms: 1,
    pendingForms: pendingFormsData,
    stats: [
      { id: '1', title: 'Ümumi kateqoriyalar', value: 5, icon: 'layers' },
      { id: '2', title: 'Tamamlanmış kateqoriyalar', value: 1, changeType: 'increase', change: 1, icon: 'check-circle' },
      { id: '3', title: 'Gözləyən kateqoriyalar', value: 4, changeType: 'neutral', change: 0, icon: 'clock' },
      { id: '4', title: 'Tamamlanma faizi', value: '20%', changeType: 'increase', change: 10, icon: 'percent' }
    ],
    recentForms: recentFormsData,
    dueDates: [
      { category: 'Şagird məlumatları', date: '2023-08-20' },
      { category: 'İnfrastruktur', date: '2023-07-15' },
      { category: 'Müəllim məlumatları', date: '2023-07-30' }
    ]
  };
}

// İstifadəçi roluna görə dashboard verilərini generasiya et
export function generateDashboardDataByRole(role: string): DashboardData {
  switch (role) {
    case 'superadmin':
      return generateSuperAdminDashboardData();
    case 'regionadmin':
      return generateRegionAdminDashboardData();
    case 'sectoradmin':
      return generateSectorAdminDashboardData();
    case 'schooladmin':
      return generateSchoolAdminDashboardData();
    default:
      // Default olaraq School Admin dashboard verilərini qaytarırıq
      return generateSchoolAdminDashboardData();
  }
}

// geriyə uyğunluq üçün alias
export const generateMockDashboardData = generateDashboardDataByRole;


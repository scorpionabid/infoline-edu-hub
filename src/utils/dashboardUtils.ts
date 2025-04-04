
import { DashboardData, SuperAdminDashboardData, RegionAdminDashboardData, SectorAdminDashboardData, SchoolAdminDashboardData } from '@/hooks/useDashboardData';
import { DashboardNotification, Notification } from '@/types/notification';

// Dashboard verilərini adaptasiya etmək üçün utility funksiyaları

// DashboardNotification-dan Notification-a adaptasiya
export const adaptNotifications = (dashboardNotifications: DashboardNotification[]): Notification[] => {
  return dashboardNotifications.map(notification => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    time: notification.time,
    isRead: notification.read || false,
    createdAt: notification.time || new Date().toISOString(),
    priority: 'normal'
  }));
};

// SuperAdmin dashboard verilərini generasiya et
export function generateSuperAdminDashboardData(): SuperAdminDashboardData {
  // Regionlar
  const regions = [
    { id: '1', name: 'Bakı', schoolCount: 120, completionRate: 85 },
    { id: '2', name: 'Sumqayıt', schoolCount: 45, completionRate: 72 },
    { id: '3', name: 'Gəncə', schoolCount: 30, completionRate: 68 },
    { id: '4', name: 'Lənkəran', schoolCount: 25, completionRate: 63 },
  ];

  // Məlumat toplama aktivliyi
  const activityData = [
    { date: '2023-07-01', count: 12 },
    { date: '2023-07-02', count: 18 },
    { date: '2023-07-03', count: 24 },
    { date: '2023-07-04', count: 32 },
    { date: '2023-07-05', count: 28 },
    { date: '2023-07-06', count: 42 },
    { date: '2023-07-07', count: 38 },
  ];

  // Kateqoriyalar
  const categories = [
    { id: '1', name: 'Təhsil statistikası', completion: 78, deadline: '2023-08-15' },
    { id: '2', name: 'Şagird məlumatları', completion: 64, deadline: '2023-08-20' },
    { id: '3', name: 'Müəllim məlumatları', completion: 82, deadline: '2023-08-10' },
    { id: '4', name: 'İnfrastruktur', completion: 45, deadline: '2023-08-25' },
  ];

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

  // Dashboard verilərini hazırla
  return {
    regions,
    activityData,
    categories,
    notifications: adaptNotifications(notificationsData),
    stats: {
      totalSchools: 220,
      completedSchools: 154,
      pendingSchools: 66,
      completionRate: 70,
    }
  };
}

// RegionAdmin dashboard verilərini generasiya et
export function generateRegionAdminDashboardData(): RegionAdminDashboardData {
  // Sektorlar
  const sectors = [
    { id: '1', name: 'Binəqədi', schoolCount: 35, completionRate: 82 },
    { id: '2', name: 'Sabunçu', schoolCount: 28, completionRate: 76 },
    { id: '3', name: 'Nəsimi', schoolCount: 32, completionRate: 68 },
    { id: '4', name: 'Yasamal', schoolCount: 25, completionRate: 64 },
  ];

  // Kateqoriyalar
  const categories = [
    { id: '1', name: 'Təhsil statistikası', completion: 78, deadline: '2023-08-15' },
    { id: '2', name: 'Şagird məlumatları', completion: 64, deadline: '2023-08-20' },
    { id: '3', name: 'Müəllim məlumatları', completion: 82, deadline: '2023-08-10' },
  ];

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
    sectors,
    categories,
    notifications: adaptNotifications(notificationsData),
    stats: {
      totalSchools: 120,
      completedSchools: 84,
      pendingSchools: 36,
      completionRate: 70,
    }
  };
}

// SectorAdmin dashboard verilərini generasiya et
export function generateSectorAdminDashboardData(): SectorAdminDashboardData {
  // Məktəblər
  const schools = [
    { id: '1', name: 'Məktəb #10', completionRate: 88, status: 'active' },
    { id: '2', name: 'Məktəb #15', completionRate: 72, status: 'active' },
    { id: '3', name: 'Məktəb #22', completionRate: 64, status: 'active' },
    { id: '4', name: 'Məktəb #7', completionRate: 92, status: 'active' },
    { id: '5', name: 'Məktəb #31', completionRate: 36, status: 'inactive' },
  ];

  // Kateqoriyalar
  const categories = [
    { id: '1', name: 'Təhsil statistikası', completion: 78, deadline: '2023-08-15' },
    { id: '2', name: 'Şagird məlumatları', completion: 64, deadline: '2023-08-20' },
  ];

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
    schools,
    categories,
    notifications: adaptNotifications(notificationsData),
    stats: {
      totalSchools: 35,
      completedSchools: 22,
      pendingSchools: 13,
      completionRate: 63,
    }
  };
}

// SchoolAdmin dashboard verilərini generasiya et
export function generateSchoolAdminDashboardData(): SchoolAdminDashboardData {
  // Kateqoriyalar və formlar
  const forms = [
    { 
      id: '1', 
      title: 'Təhsil statistikası', 
      description: 'Məktəbin ümumi təhsil statistikası məlumatları', 
      status: 'completed',
      deadline: '2023-08-15',
      completedAt: '2023-07-05T10:24:36Z'
    },
    { 
      id: '2', 
      title: 'Şagird məlumatları', 
      description: 'Məktəbdəki şagirdlərin ümumi məlumatları', 
      status: 'pending',
      deadline: '2023-08-20'
    },
    { 
      id: '3', 
      title: 'Müəllim məlumatları', 
      description: 'Müəllim heyəti haqqında detallı məlumatlar', 
      status: 'rejected',
      deadline: '2023-07-30',
      rejectionReason: 'Müəllim siyahısı tam deyil. Zəhmət olmasa, bütün müəllimlərin məlumatlarını əlavə edin.'
    },
    { 
      id: '4', 
      title: 'İnfrastruktur', 
      description: 'Məktəb binası və təchizat haqqında məlumatlar', 
      status: 'dueSoon',
      deadline: '2023-07-15'
    },
    { 
      id: '5', 
      title: 'Tədris dili', 
      description: 'Məktəbdə tədris olunan dillər haqqında məlumatlar', 
      status: 'overdue',
      deadline: '2023-07-01'
    }
  ];

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

  // Dashboard verilərini hazırla
  return {
    forms,
    notifications: adaptNotifications(notificationsData),
    stats: {
      totalCategories: 5,
      completedCategories: 1,
      pendingCategories: 4,
      completionRate: 20,
    }
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

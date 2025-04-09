
import { v4 as uuidv4 } from 'uuid';
import { Notification } from '@/types/notification';

// Mock bildiriş yaratma funksiyası
export const createMockNotification = (type: string, title: string, message: string, isRead = false): Notification => {
  return {
    id: uuidv4(),
    title,
    message,
    type: type as any,
    isRead,
    createdAt: new Date().toISOString(),
    userId: 'user-1', // Mock user ID
    priority: 'normal'
  };
};

// SuperAdmin üçün mock dashboard məlumatlarını generasiya et
export const generateSuperAdminDashboardData = () => {
  return {
    regions: 12,
    sectors: 48,
    schools: 630,
    users: 750,
    completionRate: 72,
    pendingApprovals: 25,
    notifications: [
      createMockNotification('system', 'Sistem yeniləndi', 'Sistem v2.1.0 versiyasına yeniləndi'),
      createMockNotification('approval', 'Təsdiq tələbi', '12 məktəbin məlumatları təsdiq gözləyir'),
      createMockNotification('category', 'Yeni kateqoriya', 'Tədris planı kateqoriyası əlavə edildi')
    ],
    stats: [
      { id: '1', title: 'Ümumi regionlar', value: 12, change: 0, changeType: 'neutral' },
      { id: '2', title: 'Ümumi sektorlar', value: 48, change: 2, changeType: 'increase' },
      { id: '3', title: 'Ümumi məktəblər', value: 630, change: 15, changeType: 'increase' },
      { id: '4', title: 'Aktiv istifadəçilər', value: 750, change: 50, changeType: 'increase' }
    ]
  };
};

// RegionAdmin üçün mock dashboard məlumatlarını generasiya et
export const generateRegionAdminDashboardData = () => {
  return {
    sectors: 8,
    schools: 120,
    users: 150,
    completionRate: 68,
    pendingApprovals: 15,
    pendingSchools: 12,
    approvedSchools: 98,
    rejectedSchools: 10,
    notifications: [
      createMockNotification('approval', 'Təsdiq tələbi', '8 məktəbin məlumatları təsdiq gözləyir'),
      createMockNotification('deadline', 'Son tarix yaxınlaşır', 'Şagird statistikası formu üçün son tarix: 2025-04-15')
    ]
  };
};

// SectorAdmin üçün mock dashboard məlumatlarını generasiya et
export const generateSectorAdminDashboardData = () => {
  return {
    schools: 25,
    completionRate: 75,
    pendingApprovals: 8,
    pendingSchools: 6,
    approvedSchools: 18,
    rejectedSchools: 1,
    notifications: [
      createMockNotification('deadline', 'Son tarix yaxınlaşır', '3 məktəb üçün son tarix yaxınlaşır'),
      createMockNotification('approval', 'Təsdiq tələbi', '6 məktəbin məlumatları təsdiq gözləyir')
    ]
  };
};

// SchoolAdmin üçün mock dashboard məlumatlarını generasiya et
export const generateSchoolAdminDashboardData = () => {
  return {
    forms: {
      pending: 5,
      approved: 12,
      rejected: 2,
      dueSoon: 3,
      overdue: 1
    },
    completionRate: 68,
    categories: 8,
    notifications: [
      createMockNotification('category', 'Yeni kateqoriya', 'Tədris planı kateqoriyası əlavə edildi'),
      createMockNotification('deadline', 'Son tarix yaxınlaşır', 'Şagird statistikası formu üçün son tarix: 2025-04-15')
    ],
    pendingForms: [
      { id: 'form-1', title: 'Şagird statistikası', status: 'pending', date: '2025-04-15', category: 'Təhsil' },
      { id: 'form-2', title: 'Müəllim heyəti', status: 'pending', date: '2025-04-20', category: 'Kadrlar' }
    ]
  };
};

// İstifadəçi roluna əsasən müvafiq dashboard məlumatlarını qaytarır
export const generateDashboardDataByRole = (role: string) => {
  switch (role.toLowerCase()) {
    case 'superadmin':
      return generateSuperAdminDashboardData();
    case 'regionadmin':
      return generateRegionAdminDashboardData();
    case 'sectoradmin':
      return generateSectorAdminDashboardData();
    case 'schooladmin':
    default:
      return generateSchoolAdminDashboardData();
  }
};

// Mock qrafik məlumatlarını generasiya et
export const generateMockChartData = () => {
  return {
    activityData: [
      { name: 'Login', value: 120 },
      { name: 'Form doldurma', value: 85 },
      { name: 'Məlumat əlavə etmə', value: 65 },
      { name: 'Hesabat', value: 45 },
      { name: 'İdxal/İxrac', value: 30 }
    ],
    regionSchoolsData: [
      { name: 'Bakı', value: 150 },
      { name: 'Sumqayıt', value: 80 },
      { name: 'Gəncə', value: 70 },
      { name: 'Mingəçevir', value: 40 },
      { name: 'Şəki', value: 35 },
      { name: 'Quba', value: 30 }
    ],
    categoryCompletionData: [
      { name: 'Şagird statistikası', completed: 85 },
      { name: 'Müəllim heyəti', completed: 75 },
      { name: 'İnfrastruktur', completed: 65 },
      { name: 'Maddi-texniki baza', completed: 55 },
      { name: 'Maliyyə', completed: 45 }
    ]
  };
};

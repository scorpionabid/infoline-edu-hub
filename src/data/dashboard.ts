
import { 
  SuperAdminDashboardData, 
  RegionAdminDashboardData, 
  SectorAdminDashboardData, 
  SchoolAdminDashboardData 
} from '@/types/dashboard';

// Mock data for SuperAdmin dashboard
export const mockSuperAdminDashboard = (): SuperAdminDashboardData => {
  return {
    stats: {
      regions: 12,
      sectors: 48,
      schools: 645,
      users: 723,
      categories: 15,
      columns: 87
    },
    regionStats: [
      { id: '1', name: 'Bakı', schoolCount: 120, completionRate: 85 },
      { id: '2', name: 'Gəncə', schoolCount: 75, completionRate: 78 },
      { id: '3', name: 'Sumqayıt', schoolCount: 60, completionRate: 82 },
      { id: '4', name: 'Lənkəran', schoolCount: 45, completionRate: 70 },
      { id: '5', name: 'Şəki', schoolCount: 30, completionRate: 65 }
    ],
    formsByStatus: {
      pending: 243,
      approved: 1287,
      rejected: 89,
      total: 1619
    },
    completionRate: 78,
    pendingApprovals: [
      { id: '1', schoolName: 'Məktəb 15', categoryName: 'Tədris resursları', dueDate: '2023-08-25' },
      { id: '2', schoolName: 'Məktəb 23', categoryName: 'Şagird sayı', dueDate: '2023-08-24' },
      { id: '3', schoolName: 'Məktəb 7', categoryName: 'Büdcə məlumatları', dueDate: '2023-08-26' }
    ],
    notifications: [
      { id: '1', title: 'Yeni kateqoriya', message: 'Büdcə məlumatları kateqoriyası əlavə edildi', type: 'info', isRead: false, createdAt: new Date().toISOString(), userId: '1', priority: 'normal', date: '2023-08-20', time: '09:45' },
      { id: '2', title: 'Təsdiq gözləyir', message: '25 məktəbdən məlumatlar təsdiq gözləyir', type: 'warning', isRead: false, createdAt: new Date().toISOString(), userId: '1', priority: 'high', date: '2023-08-21', time: '14:30' }
    ]
  };
};

// Mock data for RegionAdmin dashboard
export const mockRegionAdminDashboard = (): RegionAdminDashboardData => {
  return {
    sectors: 8,
    schools: 120,
    users: 145,
    pendingSchools: [
      { id: '1', name: 'Məktəb 15', sectorName: 'Sabunçu', completionRate: 60 },
      { id: '2', name: 'Məktəb 23', sectorName: 'Nizami', completionRate: 45 },
      { id: '3', name: 'Məktəb 7', sectorName: 'Binəqədi', completionRate: 75 }
    ],
    sectorStats: [
      { id: '1', name: 'Sabunçu', schoolCount: 25, completionRate: 78 },
      { id: '2', name: 'Nizami', schoolCount: 30, completionRate: 82 },
      { id: '3', name: 'Binəqədi', schoolCount: 22, completionRate: 75 },
      { id: '4', name: 'Nəsimi', schoolCount: 18, completionRate: 80 }
    ],
    completionRate: 75,
    notifications: [
      { id: '1', title: 'Yeni məktəb', message: 'Məktəb 45 regionunuza əlavə edildi', type: 'info', isRead: false, createdAt: new Date().toISOString(), userId: '1', priority: 'normal', date: '2023-08-20', time: '09:45' },
      { id: '2', title: 'Son tarix', message: 'Tədris resursları kateqoriyası üçün son tarix yaxınlaşır', type: 'warning', isRead: false, createdAt: new Date().toISOString(), userId: '1', priority: 'high', date: '2023-08-21', time: '14:30' }
    ]
  };
};

// Mock data for SectorAdmin dashboard
export const mockSectorAdminDashboard = (): SectorAdminDashboardData => {
  return {
    schools: 25,
    users: 30,
    pendingApprovals: [
      { id: '1', schoolName: 'Məktəb 15', categoryName: 'Tədris resursları', submittedAt: '2023-08-20' },
      { id: '2', schoolName: 'Məktəb 23', categoryName: 'Şagird sayı', submittedAt: '2023-08-21' },
      { id: '3', schoolName: 'Məktəb 7', categoryName: 'Büdcə məlumatları', submittedAt: '2023-08-19' }
    ],
    schoolsStats: [
      { id: '1', name: 'Məktəb 15', completionRate: 85, pendingCount: 2 },
      { id: '2', name: 'Məktəb 23', completionRate: 70, pendingCount: 5 },
      { id: '3', name: 'Məktəb 7', completionRate: 90, pendingCount: 1 },
      { id: '4', name: 'Məktəb 42', completionRate: 60, pendingCount: 7 }
    ],
    completionRate: 80,
    notifications: [
      { id: '1', title: 'Yeni məlumat', message: 'Məktəb 15 tərəfindən yeni məlumatlar təqdim edildi', type: 'info', isRead: false, createdAt: new Date().toISOString(), userId: '1', priority: 'normal', date: '2023-08-20', time: '09:45' },
      { id: '2', title: 'Təsdiq tələbi', message: 'Məktəb 23 tərəfindən təqdim edilən məlumatlar təsdiq gözləyir', type: 'warning', isRead: false, createdAt: new Date().toISOString(), userId: '1', priority: 'high', date: '2023-08-21', time: '14:30' }
    ]
  };
};

// Mock data for SchoolAdmin dashboard
export const mockSchoolAdminDashboard = (): SchoolAdminDashboardData => {
  return {
    forms: {
      pending: 5,
      approved: 10,
      rejected: 2,
      dueSoon: 3,
      overdue: 1,
      total: 21
    },
    pendingForms: [
      { id: '1', title: 'Tədris resursları', status: 'pending', completionPercentage: 100, dueDate: '2023-08-25', description: 'Məktəbin tədris resursları haqqında məlumatlar' },
      { id: '2', title: 'Şagird sayı', status: 'pending', completionPercentage: 100, dueDate: '2023-08-24', description: 'Şagirdlərin say və tərkibi haqqında məlumatlar' },
      { id: '3', title: 'Büdcə məlumatları', status: 'dueSoon', completionPercentage: 75, dueDate: '2023-08-26', description: 'Məktəb büdcəsi haqqında məlumatlar' }
    ],
    completionRate: 85,
    notifications: [
      { id: '1', title: 'Yeni kateqoriya', message: 'Büdcə məlumatları kateqoriyası əlavə edildi', type: 'info', isRead: false, createdAt: new Date().toISOString(), userId: '1', priority: 'normal', date: '2023-08-20', time: '09:45' },
      { id: '2', title: 'Son tarix', message: 'Tədris resursları kateqoriyası üçün son tarix yaxınlaşır', type: 'warning', isRead: false, createdAt: new Date().toISOString(), userId: '1', priority: 'high', date: '2023-08-21', time: '14:30' }
    ]
  };
};

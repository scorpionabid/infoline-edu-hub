
import { 
  SuperAdminDashboardData, 
  RegionAdminDashboardData,
  SectorAdminDashboardData,
  SchoolAdminDashboardData,
  DashboardData,
  ChartData
} from '@/hooks/useDashboardData';
import { Notification } from '@/types/notification';

// Mock notification data
const generateMockNotifications = (count: number = 5): Notification[] => {
  const notificationTypes = ['category', 'deadline', 'approval', 'system', 'warning', 'error', 'info', 'success'];
  const notifications: Notification[] = [];
  
  for (let i = 0; i < count; i++) {
    const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)] as any;
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 7)).toISOString();
    
    notifications.push({
      id: `notification-${i}`,
      title: `Bildiriş ${i + 1}`,
      message: `Bu bir mock bildiriş məzmunudur. Tipi: ${randomType}`,
      type: randomType,
      isRead: Math.random() > 0.3,
      createdAt,
      priority: 'normal'
    });
  }
  
  return notifications;
};

// Generate mock data for dashboard based on role
export const generateDashboardDataByRole = (role: string): DashboardData => {
  switch (role) {
    case 'superadmin':
      return generateSuperAdminData();
    case 'regionadmin':
      return generateRegionAdminData();
    case 'sectoradmin':
      return generateSectorAdminData();
    case 'schooladmin':
    default:
      return generateSchoolAdminData();
  }
};

// Alias for backward compatibility
export const generateMockDashboardData = generateDashboardDataByRole;

// Function for generating the chart data
export const generateMockChartData = (): ChartData => {
  return {
    activityData: [
      { name: 'Məlumat daxil etmə', value: 35 },
      { name: 'Təsdiq', value: 25 },
      { name: 'Kateqoriya yaratma', value: 15 },
      { name: 'Admin dəyişiklik', value: 10 },
      { name: 'Təhlil', value: 15 }
    ],
    regionSchoolsData: [
      { name: 'Bakı', value: 120 },
      { name: 'Sumqayıt', value: 45 },
      { name: 'Abşeron', value: 30 },
      { name: 'Gəncə', value: 50 },
      { name: 'Lənkəran', value: 35 }
    ],
    categoryCompletionData: [
      { name: 'Məktəb məlumatları', completed: 75 },
      { name: 'Şagird sayı', completed: 90 },
      { name: 'Müəllim məlumatları', completed: 60 },
      { name: 'Tədris planı', completed: 40 },
      { name: 'Maddi-texniki baza', completed: 55 }
    ]
  };
};

// Generating SuperAdmin Dashboard data
const generateSuperAdminData = (): SuperAdminDashboardData => {
  return {
    regions: 12,
    sectors: 48,
    schools: 645,
    users: 782,
    completionRate: 67,
    pendingApprovals: 124,
    notifications: generateMockNotifications(),
    pendingSchools: 120,
    approvedSchools: 450,
    rejectedSchools: 75,
    stats: [
      { id: 'stat-1', title: 'Toplam kateqoriya', value: 36, change: 5, changeType: 'increase', icon: 'Layers' },
      { id: 'stat-2', title: 'İstifadəçi məmnuniyyəti', value: "92%", change: 3, changeType: 'increase', icon: 'HeartHandshake' },
      { id: 'stat-3', title: 'Həftəlik aktivlik', value: 753, change: -2, changeType: 'decrease', icon: 'Activity' },
      { id: 'stat-4', title: 'Orta cavab vaxtı', value: "1.2s", change: 10, changeType: 'increase', icon: 'Timer' }
    ],
    recentForms: [
      { id: 'form-1', title: 'Əsas məktəb məlumatları', category: 'Ümumi məlumatlar', status: 'completed', completionPercentage: 100 },
      { id: 'form-2', title: 'Şagird kontingenti', category: 'Şagirdlər', status: 'approved', completionPercentage: 100 },
      { id: 'form-3', title: 'Büdcə sorğusu', category: 'Maliyyə', status: 'pending', completionPercentage: 75 },
      { id: 'form-4', title: 'Tədris proqramları', category: 'Tədris planı', status: 'rejected', completionPercentage: 60 }
    ],
    topSchools: [
      { id: 'school-1', name: 'Bakı şəhəri 6 nömrəli məktəb', completionPercentage: 98, region: 'Bakı' },
      { id: 'school-2', name: 'Gəncə şəhəri 24 nömrəli məktəb', completionPercentage: 95, region: 'Gəncə' },
      { id: 'school-3', name: 'Sumqayıt şəhəri 11 nömrəli məktəb', completionPercentage: 92, region: 'Sumqayıt' },
      { id: 'school-4', name: 'Lənkəran şəhəri 5 nömrəli məktəb', completionPercentage: 90, region: 'Lənkəran' }
    ]
  };
};

// Generating RegionAdmin Dashboard data
const generateRegionAdminData = (): RegionAdminDashboardData => {
  return {
    sectors: 12,
    schools: 145,
    users: 210,
    completionRate: 72,
    pendingApprovals: 36,
    pendingSchools: 35,
    approvedSchools: 100,
    rejectedSchools: 10,
    notifications: generateMockNotifications(),
    categories: [
      { id: 'cat-1', name: 'Ümumi məlumatlar', completionPercentage: 85, deadline: '2024-07-10', status: 'active' },
      { id: 'cat-2', name: 'Şagird sayı', completionPercentage: 92, deadline: '2024-07-15', status: 'active' },
      { id: 'cat-3', name: 'Müəllim kontingenti', completionPercentage: 65, deadline: '2024-07-20', status: 'active' },
      { id: 'cat-4', name: 'Büdcə planlaması', completionPercentage: 40, deadline: '2024-08-01', status: 'active' }
    ],
    sectorCompletions: [
      { id: 'sector-1', name: 'Nəsimi rayonu', schoolCount: 28, completionPercentage: 85 },
      { id: 'sector-2', name: 'Yasamal rayonu', schoolCount: 32, completionPercentage: 75 },
      { id: 'sector-3', name: 'Sabunçu rayonu', schoolCount: 25, completionPercentage: 65 },
      { id: 'sector-4', name: 'Xətai rayonu', schoolCount: 30, completionPercentage: 90 }
    ],
    stats: [
      { id: 'stat-1', title: 'Toplam kateqoriya', value: 24, change: 2, changeType: 'increase', icon: 'Layers' },
      { id: 'stat-2', title: 'Aktiv formlar', value: 124, change: 15, changeType: 'increase', icon: 'FileText' },
      { id: 'stat-3', title: 'Orta tamamlanma', value: "72%", change: 5, changeType: 'increase', icon: 'CheckCircle' },
      { id: 'stat-4', title: 'Cari həftə aktivliyi', value: 234, change: -3, changeType: 'decrease', icon: 'Activity' }
    ],
    recentForms: [
      { id: 'form-1', title: 'Məktəb infrastrukturu', category: 'İnfrastruktur', status: 'completed', completionPercentage: 100 },
      { id: 'form-2', title: 'Pedaqoji heyət', category: 'Müəllimlər', status: 'approved', completionPercentage: 100 },
      { id: 'form-3', title: 'İKT təchizatı', category: 'Texniki baza', status: 'pending', completionPercentage: 60 },
      { id: 'form-4', title: 'Metodik vəsaitlər', category: 'Tədris resursları', status: 'rejected', completionPercentage: 45 }
    ]
  };
};

// Generating SectorAdmin Dashboard data
const generateSectorAdminData = (): SectorAdminDashboardData => {
  return {
    schools: 32,
    completionRate: 76,
    pendingApprovals: 18,
    pendingSchools: 12,
    approvedSchools: 18,
    rejectedSchools: 2,
    notifications: generateMockNotifications(),
    stats: [
      { id: 'stat-1', title: 'Toplam məktəb', value: 32, icon: 'School' },
      { id: 'stat-2', title: 'Formlar', value: 78, icon: 'FileText' },
      { id: 'stat-3', title: 'Tamamlanma', value: "76%", icon: 'CheckCircle' },
      { id: 'stat-4', title: 'Təsdiq gözləyən', value: 18, icon: 'Clock' }
    ],
    recentForms: [
      { id: 'form-1', title: 'Şagird nailiyyətləri', category: 'Nailiyyətlər', status: 'completed', completionPercentage: 100 },
      { id: 'form-2', title: 'Dərslik təminatı', category: 'Tədris resursları', status: 'approved', completionPercentage: 100 },
      { id: 'form-3', title: 'İdman zalı avadanlığı', category: 'Maddi-texniki baza', status: 'pending', completionPercentage: 80 },
      { id: 'form-4', title: 'Elektron jurnal istifadəsi', category: 'Elektron resurslar', status: 'dueSoon', completionPercentage: 40 }
    ],
    schoolList: [
      { id: 'school-1', name: '5 nömrəli məktəb', completionPercentage: 95 },
      { id: 'school-2', name: '12 nömrəli məktəb', completionPercentage: 88 },
      { id: 'school-3', name: '18 nömrəli məktəb', completionPercentage: 76 },
      { id: 'school-4', name: '24 nömrəli məktəb', completionPercentage: 65 },
      { id: 'school-5', name: '34 nömrəli məktəb', completionPercentage: 45 }
    ]
  };
};

// Generating SchoolAdmin Dashboard data
const generateSchoolAdminData = (): SchoolAdminDashboardData => {
  return {
    forms: {
      pending: 8,
      approved: 15,
      rejected: 2,
      dueSoon: 5,
      overdue: 1
    },
    completionRate: 62,
    notifications: generateMockNotifications(),
    categories: 18,
    totalForms: 25,
    completedForms: 15,
    pendingForms: [
      { id: 'form-1', title: 'Müəllim attestasiyası', deadline: '2024-07-15', status: 'pending' },
      { id: 'form-2', title: 'Xüsusi qabiliyyət sorğusu', deadline: '2024-07-12', status: 'pending' },
      { id: 'form-3', title: 'Olimpiada nəticələri', deadline: '2024-07-18', status: 'pending' }
    ],
    rejectedForms: 2,
    dueDates: [
      { category: 'Şagird kontingenti', date: '2024-07-10' },
      { category: 'Maddi-texniki baza', date: '2024-07-15' },
      { category: 'Dərnək fəaliyyəti', date: '2024-07-20' }
    ],
    recentForms: [
      { id: 'form-1', title: 'Şagird davamiyyəti', category: 'Davamiyyət', status: 'pending', completionPercentage: 75, deadline: '2024-07-15' },
      { id: 'form-2', title: 'Məzun statistikası', category: 'Məzunlar', status: 'completed', completionPercentage: 100 },
      { id: 'form-3', title: 'Ali məktəblərə qəbul', category: 'Qəbul nəticələri', status: 'rejected', completionPercentage: 80 },
      { id: 'form-4', title: 'Kitabxana fondu', category: 'Kitabxana', status: 'approved', completionPercentage: 100 },
      { id: 'form-5', title: 'İKT avadanlıqları', category: 'İKT', status: 'dueSoon', completionPercentage: 40, deadline: '2024-07-10' }
    ],
    stats: [
      { id: 'stat-1', title: 'Toplam kateqoriya', value: 18, icon: 'Layers' },
      { id: 'stat-2', title: 'Tamamlanma', value: "62%", icon: 'CheckCircle' },
      { id: 'stat-3', title: 'Vaxtı bitənlər', value: 5, icon: 'Clock' },
      { id: 'stat-4', title: 'Yaxın müddətli', value: 3, icon: 'AlertTriangle' }
    ]
  };
};

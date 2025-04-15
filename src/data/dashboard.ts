
import { 
  CategoryStat, 
  DashboardNotification, 
  FormStatus, 
  RegionAdminDashboardData, 
  SectorAdminDashboardData, 
  SuperAdminDashboardData, 
  SchoolAdminDashboardData,
  PendingItem,
  ActivityLogItem,
  SchoolStat,
  SectorCompletionItem
} from '@/types/dashboard';

// Mock notifications
const notifications: DashboardNotification[] = [
  {
    id: '1',
    title: 'Yeni kateqoriya əlavə edildi',
    message: 'İllik hesabat kateqoriyası sistemə əlavə edildi.',
    date: '15 Apr 2025',
    type: 'info',
    isRead: false
  },
  {
    id: '2',
    title: 'Son tarix yaxınlaşır',
    message: 'Rüblük hesabat üçün son tarix: 20 Apr 2025',
    date: '14 Apr 2025',
    type: 'warning',
    isRead: false
  },
  {
    id: '3',
    title: 'Hesabat təsdiqləndi',
    message: 'İllik hesabat təsdiqləndi.',
    date: '10 Apr 2025',
    type: 'success',
    isRead: false
  }
];

// Mock data SuperAdmin üçün
export const superAdminDashboardData: SuperAdminDashboardData = {
  stats: {
    regions: 12,
    sectors: 47,
    schools: 642,
    users: 785
  },
  formsByStatus: {
    pending: 42,
    approved: 128,
    rejected: 15,
    total: 185
  },
  completionRate: 72,
  pendingApprovals: [
    { id: '1', schoolName: 'Bakı şəhəri, 45 saylı məktəb', categoryName: 'İllik hesabat', submittedAt: '15 Apr 2025, 14:30' },
    { id: '2', schoolName: 'Sumqayıt şəhəri, 12 saylı məktəb', categoryName: 'Rüblük hesabat', submittedAt: '14 Apr 2025, 12:15' },
    { id: '3', schoolName: 'Gəncə şəhəri, 8 saylı məktəb', categoryName: 'İllik hesabat', submittedAt: '13 Apr, 09:45' }
  ],
  regions: [
    { id: '1', name: 'Bakı', schoolCount: 145, sectorCount: 12, completionRate: 85 },
    { id: '2', name: 'Sumqayıt', schoolCount: 42, sectorCount: 5, completionRate: 76 },
    { id: '3', name: 'Gəncə', schoolCount: 38, sectorCount: 4, completionRate: 68 },
    { id: '4', name: 'Lənkəran', schoolCount: 35, sectorCount: 4, completionRate: 72 }
  ],
  notifications
};

// Mock data Region Admin üçün
export const regionAdminDashboardData: RegionAdminDashboardData = {
  stats: [
    { label: 'Sektorlar', value: 8 },
    { label: 'Məktəblər', value: 145 },
    { label: 'İstifadəçilər', value: 180 },
    { label: 'Kategoriyalar', value: 12 }
  ],
  sectorCompletions: [
    { id: '1', name: 'Yasamal', schoolCount: 25, completionRate: 85 },
    { id: '2', name: 'Nəsimi', schoolCount: 18, completionRate: 72 },
    { id: '3', name: 'Binəqədi', schoolCount: 22, completionRate: 68 },
    { id: '4', name: 'Xətai', schoolCount: 20, completionRate: 75 }
  ],
  categories: [
    { id: '1', name: 'İllik hesabat', completionRate: 85, status: 'active', columnCount: 24, deadline: '30 Apr 2025' },
    { id: '2', name: 'Rüblük hesabat', completionRate: 72, status: 'active', columnCount: 18, deadline: '20 Apr 2025' },
    { id: '3', name: 'Müəllim məlumatları', completionRate: 65, status: 'upcoming', columnCount: 12, deadline: '15 May 2025' }
  ],
  completionRate: 75,
  pendingApprovals: [
    { id: '1', schoolName: 'Bakı şəhəri, 45 saylı məktəb', categoryName: 'İllik hesabat', submittedAt: '15 Apr 2025, 14:30' },
    { id: '2', schoolName: 'Bakı şəhəri, 12 saylı məktəb', categoryName: 'Rüblük hesabat', submittedAt: '14 Apr 2025, 12:15' }
  ],
  notifications
};

// Mock data Sektor Admin üçün
export const sectorAdminDashboardData: SectorAdminDashboardData = {
  stats: [
    { label: 'Məktəblər', value: 25 },
    { label: 'Təsdiq gözləyən', value: 8 },
    { label: 'Tamamlanma', value: 72 },
    { label: 'İstifadəçilər', value: 28 }
  ],
  pendingItems: [
    { id: '1', schoolName: 'Bakı şəhəri, 45 saylı məktəb', categoryName: 'İllik hesabat', submittedAt: '15 Apr 2025, 14:30' },
    { id: '2', schoolName: 'Bakı şəhəri, 12 saylı məktəb', categoryName: 'Rüblük hesabat', submittedAt: '14 Apr 2025, 12:15' }
  ],
  schoolsStats: [
    { id: '1', name: 'Bakı şəhəri, 45 saylı məktəb', completionRate: 92, pendingCount: 0 },
    { id: '2', name: 'Bakı şəhəri, 12 saylı məktəb', completionRate: 78, pendingCount: 2 },
    { id: '3', name: 'Bakı şəhəri, 67 saylı məktəb', completionRate: 65, pendingCount: 3 },
    { id: '4', name: 'Bakı şəhəri, 23 saylı məktəb', completionRate: 85, pendingCount: 1 }
  ],
  completionRate: 80,
  notifications,
  activityLog: [
    { 
      id: '1', 
      action: 'Məlumat təsdiqləndi', 
      user: 'Anar Məmmədov', 
      timestamp: '15 Apr 2025, 14:35',
      details: 'İllik hesabat məlumatları təsdiqləndi',
      target: '45 saylı məktəb',
      time: '15 Apr 2025, 14:35'
    },
    { 
      id: '2', 
      action: 'Məlumat rədd edildi', 
      user: 'Anar Məmmədov', 
      timestamp: '14 Apr 2025, 16:20',
      details: 'Rüblük hesabat məlumatları rədd edildi: Məlumatlar natamamdır',
      target: '12 saylı məktəb',
      time: '14 Apr 2025, 16:20'
    },
    { 
      id: '3', 
      action: 'Admin təyin edildi', 
      user: 'Anar Məmmədov', 
      timestamp: '13 Apr 2025, 10:15',
      details: 'Yeni məktəb admini təyin edildi: Aygün Hüseynova',
      target: '67 saylı məktəb',
      time: '13 Apr 2025, 10:15'
    }
  ]
};

// Mock data Məktəb Admin üçün
export const schoolAdminDashboardData: SchoolAdminDashboardData = {
  forms: {
    pending: 3,
    approved: 5,
    rejected: 1,
    dueSoon: 2,
    overdue: 1,
    total: 12
  },
  completionRate: 65,
  pendingForms: [
    { 
      id: '1', 
      title: 'İllik hesabat', 
      category: 'Hesabatlar', 
      date: '30 Apr 2025', 
      status: FormStatus.PENDING, 
      completionPercentage: 75 
    },
    { 
      id: '2', 
      title: 'Rüblük hesabat', 
      category: 'Hesabatlar', 
      date: '20 Apr 2025', 
      status: FormStatus.DUE_SOON, 
      completionPercentage: 30 
    },
    { 
      id: '3', 
      title: 'Müəllim məlumatları', 
      category: 'Kadrlar', 
      date: '15 May 2025', 
      status: FormStatus.PENDING, 
      completionPercentage: 50 
    }
  ],
  notifications
};

// Chart data for visualization
export const mockChartData = {
  activityData: [
    { name: 'Yanvar', value: 65 },
    { name: 'Fevral', value: 72 },
    { name: 'Mart', value: 78 },
    { name: 'Aprel', value: 85 },
    { name: 'May', value: 90 }
  ],
  regionSchoolsData: [
    { name: 'Bakı', value: 145 },
    { name: 'Sumqayıt', value: 42 },
    { name: 'Gəncə', value: 38 },
    { name: 'Lənkəran', value: 35 },
    { name: 'Şəki', value: 28 }
  ],
  categoryCompletionData: [
    { name: 'İllik hesabat', completed: 85 },
    { name: 'Rüblük hesabat', completed: 72 },
    { name: 'Müəllim məlumatları', completed: 65 },
    { name: 'Şagird statistikası', completed: 78 },
    { name: 'Maddi texniki baza', completed: 60 }
  ]
};

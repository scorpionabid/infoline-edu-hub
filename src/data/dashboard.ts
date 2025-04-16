
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
  SectorCompletionItem,
  FormItem,
  CompletionStats
} from '@/types/dashboard';

// Mock notifications
const notifications: DashboardNotification[] = [
  {
    id: '1',
    title: 'Yeni kateqoriya əlavə edildi',
    message: 'İllik hesabat kateqoriyası sistemə əlavə edildi.',
    timestamp: '2025-04-15T14:30:00Z',
    date: '2025-04-15',
    type: 'info',
    read: false
  },
  {
    id: '2',
    title: 'Son tarix yaxınlaşır',
    message: 'Rüblük hesabat üçün son tarix: 20 Apr 2025',
    timestamp: '2025-04-14T12:15:00Z',
    date: '2025-04-14',
    type: 'warning',
    read: false
  },
  {
    id: '3',
    title: 'Hesabat təsdiqləndi',
    message: 'İllik hesabat təsdiqləndi.',
    timestamp: '2025-04-10T09:45:00Z',
    date: '2025-04-10',
    type: 'success',
    read: false
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
    { 
      id: '1', 
      title: 'İllik hesabat',
      date: '2025-04-15', 
      status: 'pending',
      schoolName: 'Bakı şəhəri, 45 saylı məktəb', 
      categoryName: 'İllik hesabat', 
      submittedAt: '15 Apr 2025, 14:30' 
    },
    { 
      id: '2', 
      title: 'Rüblük hesabat',
      date: '2025-04-14', 
      status: 'pending',
      schoolName: 'Sumqayıt şəhəri, 12 saylı məktəb', 
      categoryName: 'Rüblük hesabat', 
      submittedAt: '14 Apr 2025, 12:15' 
    },
    { 
      id: '3', 
      title: 'İllik hesabat',
      date: '2025-04-13', 
      status: 'pending',
      schoolName: 'Gəncə şəhəri, 8 saylı məktəb', 
      categoryName: 'İllik hesabat', 
      submittedAt: '13 Apr, 09:45' 
    }
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
  stats: {
    sectors: 8,
    schools: 145,
    users: 180
  },
  pendingItems: [
    { 
      id: '1', 
      title: 'İllik hesabat',
      date: '2025-04-15', 
      status: 'pending',
      schoolName: 'Bakı şəhəri, 45 saylı məktəb', 
      categoryName: 'İllik hesabat', 
      submittedAt: '15 Apr 2025, 14:30' 
    },
    { 
      id: '2', 
      title: 'Rüblük hesabat',
      date: '2025-04-14', 
      status: 'pending',
      schoolName: 'Bakı şəhəri, 12 saylı məktəb', 
      categoryName: 'Rüblük hesabat', 
      submittedAt: '14 Apr 2025, 12:15' 
    }
  ],
  sectorCompletions: [
    { id: '1', name: 'Yasamal', schoolCount: 25, completionRate: 85 },
    { id: '2', name: 'Nəsimi', schoolCount: 18, completionRate: 72 },
    { id: '3', name: 'Binəqədi', schoolCount: 22, completionRate: 68 },
    { id: '4', name: 'Xətai', schoolCount: 20, completionRate: 75 }
  ],
  sectors: [
    { id: '1', name: 'Yasamal', schoolCount: 25, completionRate: 85 },
    { id: '2', name: 'Nəsimi', schoolCount: 18, completionRate: 72 },
    { id: '3', name: 'Binəqədi', schoolCount: 22, completionRate: 68 },
    { id: '4', name: 'Xətai', schoolCount: 20, completionRate: 75 }
  ],
  categories: [
    { 
      id: '1', 
      name: 'İllik hesabat', 
      completion: { total: 100, completed: 85, percentage: 85 },
      completionRate: 85, 
      status: 'active', 
      columnCount: 24, 
      deadline: '30 Apr 2025',
      schools: 145
    },
    { 
      id: '2', 
      name: 'Rüblük hesabat', 
      completion: { total: 100, completed: 72, percentage: 72 },
      completionRate: 72, 
      status: 'active', 
      columnCount: 18, 
      deadline: '20 Apr 2025',
      schools: 145
    },
    { 
      id: '3', 
      name: 'Müəllim məlumatları', 
      completion: { total: 100, completed: 65, percentage: 65 },
      completionRate: 65, 
      status: 'upcoming', 
      columnCount: 12, 
      deadline: '15 May 2025',
      schools: 145
    }
  ],
  completionRate: 75,
  pendingApprovals: [
    { 
      id: '1', 
      title: 'İllik hesabat',
      date: '2025-04-15', 
      status: 'pending',
      schoolName: 'Bakı şəhəri, 45 saylı məktəb', 
      categoryName: 'İllik hesabat', 
      submittedAt: '15 Apr 2025, 14:30' 
    },
    { 
      id: '2', 
      title: 'Rüblük hesabat',
      date: '2025-04-14', 
      status: 'pending',
      schoolName: 'Bakı şəhəri, 12 saylı məktəb', 
      categoryName: 'Rüblük hesabat', 
      submittedAt: '14 Apr 2025, 12:15' 
    }
  ],
  notifications
};

// Mock data Sektor Admin üçün
export const sectorAdminDashboardData: SectorAdminDashboardData = {
  stats: {
    schools: 25,
    users: 28
  },
  pendingItems: [
    { 
      id: '1', 
      title: 'İllik hesabat',
      date: '2025-04-15', 
      status: 'pending',
      schoolName: 'Bakı şəhəri, 45 saylı məktəb', 
      categoryName: 'İllik hesabat'
    },
    { 
      id: '2', 
      title: 'Rüblük hesabat',
      date: '2025-04-14', 
      status: 'pending',
      schoolName: 'Bakı şəhəri, 12 saylı məktəb', 
      categoryName: 'Rüblük hesabat'
    }
  ],
  schools: [
    { 
      id: '1', 
      name: 'Bakı şəhəri, 45 saylı məktəb', 
      sector: 'Yasamal',
      completion: { total: 100, completed: 92, percentage: 92 },
      completionRate: 92, 
      pendingCount: 0 
    },
    { 
      id: '2', 
      name: 'Bakı şəhəri, 12 saylı məktəb', 
      sector: 'Yasamal',
      completion: { total: 100, completed: 78, percentage: 78 },
      completionRate: 78, 
      pendingCount: 2 
    },
    { 
      id: '3', 
      name: 'Bakı şəhəri, 67 saylı məktəb', 
      sector: 'Yasamal',
      completion: { total: 100, completed: 65, percentage: 65 },
      completionRate: 65, 
      pendingCount: 3 
    },
    { 
      id: '4', 
      name: 'Bakı şəhəri, 23 saylı məktəb', 
      sector: 'Yasamal',
      completion: { total: 100, completed: 85, percentage: 85 },
      completionRate: 85, 
      pendingCount: 1 
    }
  ],
  schoolsStats: [
    { 
      id: '1', 
      name: 'Bakı şəhəri, 45 saylı məktəb', 
      sector: 'Yasamal',
      completion: { total: 100, completed: 92, percentage: 92 },
      completionRate: 92, 
      pendingCount: 0,
      completionPercentage: 92
    },
    { 
      id: '2', 
      name: 'Bakı şəhəri, 12 saylı məktəb', 
      sector: 'Yasamal',
      completion: { total: 100, completed: 78, percentage: 78 },
      completionRate: 78, 
      pendingCount: 2,
      completionPercentage: 78
    },
    { 
      id: '3', 
      name: 'Bakı şəhəri, 67 saylı məktəb', 
      sector: 'Yasamal',
      completion: { total: 100, completed: 65, percentage: 65 },
      completionRate: 65, 
      pendingCount: 3,
      completionPercentage: 65
    },
    { 
      id: '4', 
      name: 'Bakı şəhəri, 23 saylı məktəb', 
      sector: 'Yasamal',
      completion: { total: 100, completed: 85, percentage: 85 },
      completionRate: 85, 
      pendingCount: 1,
      completionPercentage: 85
    }
  ],
  categories: [
    { 
      id: '1', 
      name: 'İllik hesabat', 
      completion: { total: 25, completed: 18, percentage: 72 },
      completionRate: 72, 
      status: 'active', 
      deadline: '30 Apr 2025' 
    },
    { 
      id: '2', 
      name: 'Rüblük hesabat', 
      completion: { total: 25, completed: 15, percentage: 60 },
      completionRate: 60, 
      status: 'active', 
      deadline: '20 Apr 2025' 
    }
  ],
  completionRate: 80,
  notifications,
  activityLog: [
    { 
      id: '1', 
      action: 'Məlumat təsdiqləndi', 
      user: 'Anar Məmmədov', 
      entityType: 'data_entry',
      entityId: '123',
      timestamp: '2025-04-15T14:35:00Z',
      details: 'İllik hesabat məlumatları təsdiqləndi',
      target: '45 saylı məktəb',
      time: '15 Apr 2025, 14:35'
    },
    { 
      id: '2', 
      action: 'Məlumat rədd edildi', 
      user: 'Anar Məmmədov', 
      entityType: 'data_entry',
      entityId: '124',
      timestamp: '2025-04-14T16:20:00Z',
      details: 'Rüblük hesabat məlumatları rədd edildi: Məlumatlar natamamdır',
      target: '12 saylı məktəb',
      time: '14 Apr 2025, 16:20'
    },
    { 
      id: '3', 
      action: 'Admin təyin edildi', 
      user: 'Anar Məmmədov', 
      entityType: 'user',
      entityId: '125',
      timestamp: '2025-04-13T10:15:00Z',
      details: 'Yeni məktəb admini təyin edildi: Aygün Hüseynova',
      target: '67 saylı məktəb',
      time: '13 Apr 2025, 10:15'
    }
  ],
  recentActivities: [
    { 
      id: '1', 
      action: 'Məlumat təsdiqləndi', 
      user: 'Anar Məmmədov', 
      entityType: 'data_entry',
      entityId: '123',
      timestamp: '2025-04-15T14:35:00Z',
      details: 'İllik hesabat məlumatları təsdiqləndi',
      target: '45 saylı məktəb'
    },
    { 
      id: '2', 
      action: 'Məlumat rədd edildi', 
      user: 'Anar Məmmədov', 
      entityType: 'data_entry',
      entityId: '124',
      timestamp: '2025-04-14T16:20:00Z',
      details: 'Rüblük hesabat məlumatları rədd edildi: Məlumatlar natamamdır',
      target: '12 saylı məktəb'
    },
    { 
      id: '3', 
      action: 'Admin təyin edildi', 
      user: 'Anar Məmmədov', 
      entityType: 'user',
      entityId: '125',
      timestamp: '2025-04-13T10:15:00Z',
      details: 'Yeni məktəb admini təyin edildi: Aygün Hüseynova',
      target: '67 saylı məktəb'
    }
  ]
};

// Mock data Məktəb Admin üçün
export const schoolAdminDashboardData: SchoolAdminDashboardData = {
  formStats: {
    total: 12,
    pending: 3,
    approved: 5,
    rejected: 1,
    drafts: 3
  },
  categories: [
    { 
      id: '1', 
      name: 'İllik hesabat', 
      completion: { total: 24, completed: 18, percentage: 75 }
    },
    { 
      id: '2', 
      name: 'Rüblük hesabat', 
      completion: { total: 18, completed: 6, percentage: 30 }
    },
    { 
      id: '3', 
      name: 'Müəllim məlumatları', 
      completion: { total: 12, completed: 6, percentage: 50 }
    }
  ],
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
  completion: {
    total: 100,
    completed: 65,
    percentage: 65
  },
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


import { 
  SuperAdminDashboardData, 
  RegionAdminDashboardData, 
  SectorAdminDashboardData,
  SchoolAdminDashboardData,
  StatsItem,
  FormItem,
  DashboardNotification,
  CategoryCompletion,
  SectorCompletion,
  ChartData
} from '@/hooks/useDashboardData';

// Mock stats yaratmaq üçün funksiya
export const generateMockStats = (role: string): StatsItem[] => {
  switch (role) {
    case 'superadmin':
      return [
        { id: '1', title: 'Ümumi məktəb', value: 634, change: 5, changeType: 'increase' },
        { id: '2', title: 'Aktiv istifadəçi', value: 912, change: 12, changeType: 'increase' },
        { id: '3', title: 'Tamamlanma faizi', value: '76%', change: 8, changeType: 'increase' },
        { id: '4', title: 'Kateqoriyalar', value: 18, change: 2, changeType: 'increase' }
      ];
    case 'regionadmin':
      return [
        { id: '1', title: 'Region məktəbləri', value: 126, change: 3, changeType: 'increase' },
        { id: '2', title: 'Aktiv istifadəçi', value: 158, change: 7, changeType: 'increase' },
        { id: '3', title: 'Tamamlanma faizi', value: '72%', change: 5, changeType: 'increase' },
        { id: '4', title: 'Sektorlar', value: 6, change: 0, changeType: 'neutral' }
      ];
    case 'sectoradmin':
      return [
        { id: '1', title: 'Sektor məktəbləri', value: 24, change: 1, changeType: 'increase' },
        { id: '2', title: 'Qəbul gözləyən', value: 8, change: 2, changeType: 'decrease' },
        { id: '3', title: 'Tamamlanma faizi', value: '68%', change: 4, changeType: 'increase' },
        { id: '4', title: 'Tam tamamlanan', value: 12, change: 3, changeType: 'increase' }
      ];
    default: // schooladmin
      return [
        { id: '1', title: 'Kateqoriyalar', value: 12, change: 0, changeType: 'neutral' },
        { id: '2', title: 'Tamamlanma faizi', value: '85%', change: 10, changeType: 'increase' },
        { id: '3', title: 'Gözləmədə', value: 3, change: -2, changeType: 'decrease' },
        { id: '4', title: 'Təsdiqlənmiş', value: 9, change: 2, changeType: 'increase' }
      ];
  }
};

// Mock notifications yaratmaq üçün funksiya
export const generateMockNotifications = (): DashboardNotification[] => {
  return [
    {
      id: '1',
      title: 'Yeni kateqoriya',
      message: 'Müəllim məlumatları kateqoriyası əlavə edilib',
      time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      type: 'info',
      read: false
    },
    {
      id: '2',
      title: 'Son tarix xəbərdarlığı',
      message: 'Şagird nailiyyətləri formu üçün son 2 gün qalıb',
      time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      type: 'warning',
      read: false
    },
    {
      id: '3',
      title: 'Təsdiq tələbi',
      message: '5 məktəbin təqdim etdiyi məlumatlar təsdiq gözləyir',
      time: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      type: 'task',
      read: true
    },
    {
      id: '4',
      title: 'Sistem yenilənməsi',
      message: 'InfoLine sistemi v1.2 versiyasına yeniləndi',
      time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      type: 'system',
      read: true
    }
  ];
};

// Mock forms yaratmaq üçün funksiya
export const generateMockForms = (count: number, type: string = 'recent'): FormItem[] => {
  const statuses = type === 'pending' 
    ? ['pending', 'overdue', 'dueSoon'] 
    : ['approved', 'rejected', 'pending', 'draft'];
  
  const forms = [];
  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const completionPercentage = status === 'approved' ? 100 : Math.floor(Math.random() * 100);
    forms.push({
      id: `form-${i+1}`,
      title: `Form ${i+1}`,
      category: ['Ümumi məlumat', 'Müəllim heyəti', 'Şagirdlər', 'Maddi-texniki baza'][i % 4],
      status,
      completionPercentage,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * (i + 1)).toISOString()
    });
  }
  
  return forms;
};

// Mock category completions yaratmaq üçün funksiya
export const generateMockCategoryCompletions = (count: number): CategoryCompletion[] => {
  const categories = [];
  for (let i = 0; i < count; i++) {
    categories.push({
      id: `cat-${i+1}`,
      name: ['Ümumi məlumat', 'Müəllim heyəti', 'Şagirdlər', 'Maddi-texniki baza', 'Tədris planı'][i % 5],
      completionPercentage: Math.floor(Math.random() * 100),
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * (i + 3)).toISOString(),
      status: ['active', 'pending', 'completed'][i % 3]
    });
  }
  
  return categories;
};

// Mock sektor tamamlanma məlumatları yaratmaq üçün funksiya
export const generateMockSectorCompletions = (count: number): SectorCompletion[] => {
  const sectors = [];
  for (let i = 0; i < count; i++) {
    sectors.push({
      id: `sector-${i+1}`,
      name: `Sektor ${i+1}`,
      schoolCount: 10 + Math.floor(Math.random() * 20),
      completionPercentage: Math.floor(Math.random() * 100)
    });
  }
  
  return sectors;
};

// Mock məktəb məlumatları yaratmaq üçün funksiya
export const generateMockSchools = (count: number, includeRegion: boolean = false) => {
  const schools = [];
  for (let i = 0; i < count; i++) {
    const school = {
      id: `school-${i+1}`,
      name: `Məktəb №${i+1}`,
      completionPercentage: Math.floor(Math.random() * 100)
    };
    
    if (includeRegion) {
      Object.assign(school, { region: `Region ${Math.floor(i / 3) + 1}` });
    }
    
    schools.push(school);
  }
  
  return schools;
};

// SuperAdmin üçün mock data yaratmaq üçün funksiya
export const generateSuperAdminData = (): SuperAdminDashboardData => {
  return {
    stats: generateMockStats('superadmin'),
    notifications: generateMockNotifications(),
    recentForms: generateMockForms(5),
    pendingApprovals: generateMockForms(4, 'pending'),
    topSchools: generateMockSchools(5, true)
  };
};

// RegionAdmin üçün mock data yaratmaq üçün funksiya
export const generateRegionAdminData = (): RegionAdminDashboardData => {
  return {
    stats: generateMockStats('regionadmin'),
    notifications: generateMockNotifications(),
    recentForms: generateMockForms(5),
    pendingApprovals: generateMockForms(3, 'pending'),
    sectorCompletions: generateMockSectorCompletions(5),
    categories: generateMockCategoryCompletions(4)
  };
};

// SectorAdmin üçün mock data yaratmaq üçün funksiya
export const generateSectorAdminData = (): SectorAdminDashboardData => {
  return {
    stats: generateMockStats('sectoradmin'),
    notifications: generateMockNotifications(),
    recentForms: generateMockForms(5),
    pendingApprovals: generateMockForms(4, 'pending'),
    schools: generateMockSchools(8)
  };
};

// SchoolAdmin üçün mock data yaratmaq üçün funksiya
export const generateSchoolAdminData = (): SchoolAdminDashboardData => {
  return {
    stats: generateMockStats('schooladmin'),
    notifications: generateMockNotifications(),
    recentForms: generateMockForms(5),
    pendingForms: generateMockForms(3, 'pending'),
    completedCategories: generateMockCategoryCompletions(6)
  };
};

// Ümumi dashboard data generatoru
export const generateMockDashboardData = (role: string) => {
  switch (role) {
    case 'superadmin':
      return generateSuperAdminData();
    case 'regionadmin':
      return generateRegionAdminData();
    case 'sectoradmin':
      return generateSectorAdminData();
    default: // schooladmin
      return generateSchoolAdminData();
  }
};

// Mock chart data generatoru
export const generateMockChartData = (): ChartData => {
  return {
    activityData: [
      { name: 'Baxış', value: 400 },
      { name: 'Form doldurmağa başlama', value: 300 },
      { name: 'Form tamamlanması', value: 230 },
      { name: 'Form təsdiqi', value: 180 }
    ],
    regionSchoolsData: [
      { name: 'Bakı', value: 120 },
      { name: 'Sumqayıt', value: 80 },
      { name: 'Gəncə', value: 70 },
      { name: 'Lənkəran', value: 50 },
      { name: 'Şəki', value: 40 }
    ],
    categoryCompletionData: [
      { name: 'Ümumi məlumat', completed: 85 },
      { name: 'Müəllim heyəti', completed: 76 },
      { name: 'Şagirdlər', completed: 65 },
      { name: 'Maddi-texniki baza', completed: 58 }
    ]
  };
};

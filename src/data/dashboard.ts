import { 
  SuperAdminDashboardData, 
  DashboardStatus,
  RegionAdminDashboardData, 
  SectorAdminDashboardData, 
  SchoolAdminDashboardData 
} from '@/types/dashboard';

const mockForms = [
  {
    id: "form-1",
    name: "Məktəb İnfrastrukturu",
    status: "pending" as DashboardStatus,
    lastModified: "2024-01-15",
    completionRate: 75,
    submissions: 45
  },
  {
    id: "form-2", 
    name: "Müəllim Sayı",
    status: "approved" as DashboardStatus,
    lastModified: "2024-01-14",
    completionRate: 100,
    submissions: 52
  },
  {
    id: "form-3",
    name: "Şagird Statistikası", 
    status: "rejected" as DashboardStatus,
    lastModified: "2024-01-13",
    completionRate: 60,
    submissions: 38
  },
  {
    id: "form-4",
    name: "Texniki Avadanlıq",
    status: "completed" as DashboardStatus,
    lastModified: "2024-01-12",
    completionRate: 95,
    submissions: 41
  }
];

export const mockDashboardStatus: DashboardStatus = {
  total: 120,
  pending: 25,
  approved: 85,
  rejected: 10,
  schools: {
    total: 120,
    active: 90,
    inactive: 30,
  },
  sectors: {
    total: 30,
    active: 25,
    inactive: 5,
  },
  regions: {
    total: 10,
    active: 10,
    inactive: 0,
  },
  users: {
    total: 500,
    active: 450,
    inactive: 50,
  },
};

export const mockFormItems: FormItem[] = [
  {
    id: '1',
    name: 'Müəllim məlumatları',
    status: 'pending' as const,
    lastModified: '2024-12-31T23:59:59Z',
    completionRate: 75,
    submissions: 25,
    completion: 75,
    deadline: '2024-12-31T23:59:59Z'
  },
  {
    id: '2', 
    name: 'Şagird məlumatları',
    status: 'approved' as const,
    lastModified: '2024-11-30T23:59:59Z',
    completionRate: 90,
    submissions: 30,
    completion: 90,
    deadline: '2024-11-30T23:59:59Z'
  },
  {
    id: '3',
    name: 'İnfrastruktur məlumatları', 
    status: 'rejected' as const,
    lastModified: '2024-10-31T23:59:59Z',
    completionRate: 45,
    submissions: 15,
    completion: 45,
    deadline: '2024-10-31T23:59:59Z'
  },
  {
    id: '4',
    name: 'Maliyyə hesabatı',
    status: 'pending' as const,
    lastModified: '2024-12-15T23:59:59Z',
    completionRate: 60,
    submissions: 20,
    completion: 60,
    deadline: '2024-12-15T23:59:59Z'
  }
];

export const mockCategoryItems: CategoryItem[] = [
  {
    id: '1',
    name: 'Ümumi məlumatlar',
    completionRate: 80,
    status: 'completed'
  },
  {
    id: '2',
    name: 'Müəllimlər',
    completionRate: 65,
    status: 'in_progress'
  },
  {
    id: '3',
    name: 'Şagirdlər',
    completionRate: 90,
    status: 'completed'
  },
  {
    id: '4',
    name: 'İnfrastruktur',
    completionRate: 75,
    status: 'in_progress'
  },
];

export const mockDeadlineItems: DeadlineItem[] = [
  {
    id: '1',
    title: 'Hesabat 1',
    name: 'Hesabat 1',
    deadline: '2024-06-30',
    status: 'upcoming',
    daysLeft: 5
  },
  {
    id: '2',
    title: 'Hesabat 2',
    name: 'Hesabat 2',
    deadline: '2024-07-15',
    status: 'completed',
    daysLeft: 0
  },
  {
    id: '3',
    title: 'Hesabat 3',
    name: 'Hesabat 3',
    deadline: '2024-08-01',
    status: 'upcoming',
    daysLeft: 15
  },
];

export const mockPendingApprovals: PendingApproval[] = [
  {
    id: '1',
    schoolName: '1 nömrəli məktəb',
    categoryName: 'Təmir hesabatı',
    date: '2024-05-20',
    status: 'pending'
  },
  {
    id: '2',
    schoolName: '2 nömrəli məktəb',
    categoryName: 'Müəllim ərizəsi',
    date: '2024-05-22',
    status: 'pending'
  },
];

export const mockSchoolStats: SchoolStat[] = [
  {
    id: '1',
    name: '1 nömrəli məktəb',
    completionRate: 75,
    status: 'active',
    totalForms: 10,
    completedForms: 7,
    pendingForms: 3,
    lastUpdated: '2024-05-20'
  },
  {
    id: '2',
    name: '2 nömrəli məktəb',
    completionRate: 85,
    status: 'active',
    totalForms: 12,
    completedForms: 10,
    pendingForms: 2,
    lastUpdated: '2024-05-21'
  },
  {
    id: '3',
    name: '3 nömrəli məktəb',
    completionRate: 60,
    status: 'active',
    totalForms: 8,
    completedForms: 5,
    pendingForms: 3,
    lastUpdated: '2024-05-19'
  },
];

export const mockSectorStats: SectorStat[] = [
  {
    id: '1',
    name: 'Sektor 1',
    completionRate: 80,
    schoolCount: 15,
    totalSchools: 15,
    activeSchools: 14,
    status: 'active'
  },
  {
    id: '2',
    name: 'Sektor 2',
    completionRate: 70,
    schoolCount: 12,
    totalSchools: 12,
    activeSchools: 11,
    status: 'active'
  },
  {
    id: '3',
    name: 'Sektor 3',
    completionRate: 90,
    schoolCount: 18,
    totalSchools: 18,
    activeSchools: 18,
    status: 'active'
  },
];

export const mockSectorFormItems: FormItem[] = [
  {
    id: '1',
    name: 'Bölgə məlumatları',
    status: 'pending' as const,
    lastModified: '2024-12-31T23:59:59Z',
    completionRate: 75,
    submissions: 85,
    completion: 75,
    deadline: '2024-12-31T23:59:59Z'
  },
  {
    id: '2',
    name: 'Məktəb siyahısı',
    status: 'approved' as const,
    lastModified: '2024-11-30T23:59:59Z',
    completionRate: 90,
    submissions: 120,
    completion: 90,
    deadline: '2024-11-30T23:59:59Z'
  },
  {
    id: '3',
    name: 'Müəllim hesabatı',
    status: 'rejected' as const,
    lastModified: '2024-10-31T23:59:59Z',
    completionRate: 45,
    submissions: 65,
    completion: 45,
    deadline: '2024-10-31T23:59:59Z'
  },
  {
    id: '4',
    name: 'Şagird statistikası',
    status: 'pending' as const,
    lastModified: '2024-12-15T23:59:59Z',
    completionRate: 80,
    submissions: 95,
    completion: 80,
    deadline: '2024-12-15T23:59:59Z'
  },
  {
    id: '5',
    name: 'Texniki avadanlıq',
    status: 'approved' as const,
    lastModified: '2024-11-15T23:59:59Z',
    completionRate: 85,
    submissions: 75,
    completion: 85,
    deadline: '2024-11-15T23:59:59Z'
  },
  {
    id: '6',
    name: 'Məlumat təhlükəsizliyi',
    status: 'pending' as const,
    lastModified: '2024-12-20T23:59:59Z',
    completionRate: 70,
    submissions: 55,
    completion: 70,
    deadline: '2024-12-20T23:59:59Z'
  }
];

export const getMockSuperAdminData = (): SuperAdminDashboardData => ({
  forms: mockForms,
  stats: {
    totalForms: 150,
    completedForms: 120,
    pendingForms: 30,
    approvalRate: 85
  },
  categories: [
    { id: "cat-1", name: "İnfrastruktur", status: "active", completionRate: 78 },
    { id: "cat-2", name: "Kadrlar", status: "active", completionRate: 92 },
    { id: "cat-3", name: "Təhsil", status: "pending", completionRate: 65 }
  ],
  deadlines: [
    {
      id: "deadline-1",
      name: "Q1 Hesabat",
      deadline: "2024-03-31",
      dueDate: "2024-03-31",
      status: "approaching",
      daysLeft: 15
    }
  ],
  schools: {
    totalSchools: 1250,
    activeSchools: 1180,
    inactiveSchools: 70
  },
  sectors: {
    totalSectors: 45,
    activeSectors: 42,
    inactiveSectors: 3
  },
  regions: {
    totalRegions: 12,
    activeRegions: 12,
    inactiveRegions: 0
  }
});

export const getMockRegionAdminData = (): RegionAdminDashboardData => ({
  forms: mockForms,
  stats: {
    totalForms: 75,
    completedForms: 60,
    pendingForms: 15,
    approvalRate: 88
  },
  categories: [
    { id: "cat-1", name: "İnfrastruktur", status: "active", completionRate: 78 },
    { id: "cat-2", name: "Kadrlar", status: "active", completionRate: 92 }
  ],
  deadlines: [
    {
      id: "deadline-1",
      name: "Q1 Hesabat",
      deadline: "2024-03-31", 
      dueDate: "2024-03-31",
      status: "approaching",
      daysLeft: 15
    }
  ],
  sectors: [
    {
      id: "sector-1",
      name: "Nəsimi",
      schoolCount: 25,
      totalSchools: 25,
      activeSchools: 24,
      completionRate: 85,
      status: "active"
    }
  ]
});

export const getMockSectorAdminData = (): SectorAdminDashboardData => ({
  forms: [
    {
      id: "form-1",
      name: "Məktəb İnfrastrukturu",
      status: "pending" as DashboardStatus,
      lastModified: "2024-01-15",
      completionRate: 75,
      submissions: 12
    },
    {
      id: "form-2",
      name: "Müəllim Sayı", 
      status: "approved" as DashboardStatus,
      lastModified: "2024-01-14",
      completionRate: 100,
      submissions: 15
    },
    {
      id: "form-3",
      name: "Şagird Statistikası",
      status: "rejected" as DashboardStatus,
      lastModified: "2024-01-13", 
      completionRate: 60,
      submissions: 8
    },
    {
      id: "form-4",
      name: "Texniki Avadanlıq",
      status: "completed" as DashboardStatus,
      lastModified: "2024-01-12",
      completionRate: 95,
      submissions: 14
    },
    {
      id: "form-5",
      name: "Maliyyə Hesabatı",
      status: "in_progress" as DashboardStatus,
      lastModified: "2024-01-11",
      completionRate: 40,
      submissions: 6
    },
    {
      id: "form-6",
      name: "Kitabxana Fondu",
      status: "not_started" as DashboardStatus,
      lastModified: "2024-01-10",
      completionRate: 0,
      submissions: 0
    }
  ],
  stats: {
    totalForms: 25,
    completedForms: 20,
    pendingForms: 5,
    approvalRate: 92
  },
  categories: [
    { id: "cat-1", name: "İnfrastruktur", status: "active", completionRate: 78 },
    { id: "cat-2", name: "Kadrlar", status: "active", completionRate: 92 }
  ],
  deadlines: [
    {
      id: "deadline-1",
      name: "Q1 Hesabat",
      deadline: "2024-03-31",
      dueDate: "2024-03-31", 
      status: "approaching",
      daysLeft: 15
    }
  ],
  schools: [
    {
      id: "school-1",
      name: "Məktəb #1",
      completionRate: 85,
      totalForms: 5,
      completedForms: 4,
      pendingForms: 1,
      status: "active",
      lastUpdated: "2024-01-15"
    }
  ]
});

export const getMockSchoolAdminData = (): SchoolAdminDashboardData => ({
  forms: [
    {
      id: "form-1",
      name: "Məktəb İnfrastrukturu",
      status: "pending" as DashboardStatus,
      lastModified: "2024-01-15",
      completionRate: 75
    },
    {
      id: "form-2",
      name: "Müəllim Sayı",
      status: "approved" as DashboardStatus,
      lastModified: "2024-01-14", 
      completionRate: 100
    }
  ],
  stats: {
    totalForms: 8,
    completedForms: 6,
    pendingForms: 2,
    approvalRate: 95
  },
  categories: [
    { id: "cat-1", name: "İnfrastruktur", status: "approved", completionRate: 100 }
  ],
  deadlines: [
    {
      id: "deadline-1",
      name: "Q1 Hesabat",
      deadline: "2024-03-31",
      dueDate: "2024-03-31",
      status: "approaching",
      daysLeft: 15
    }
  ]
});

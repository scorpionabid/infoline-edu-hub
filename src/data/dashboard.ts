import {
  DashboardStatus,
  FormItem,
  CategoryItem,
  DeadlineItem,
  PendingApproval,
  SchoolStat,
  SectorStat,
} from '@/types/dashboard';

export const mockDashboardStatus: DashboardStatus = {
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
    submissions: 25,
    completion: 75,
    deadline: '2024-12-31T23:59:59Z'
  },
  {
    id: '2', 
    name: 'Şagird məlumatları',
    status: 'approved' as const,
    submissions: 30,
    completion: 90,
    deadline: '2024-11-30T23:59:59Z'
  },
  {
    id: '3',
    name: 'İnfrastruktur məlumatları', 
    status: 'rejected' as const,
    submissions: 15,
    completion: 45,
    deadline: '2024-10-31T23:59:59Z'
  },
  {
    id: '4',
    name: 'Maliyyə hesabatı',
    status: 'pending' as const,
    submissions: 20,
    completion: 60,
    deadline: '2024-12-15T23:59:59Z'
  }
];

export const mockCategoryItems: CategoryItem[] = [
  {
    id: '1',
    name: 'Ümumi məlumatlar',
    completion: 80,
  },
  {
    id: '2',
    name: 'Müəllimlər',
    completion: 65,
  },
  {
    id: '3',
    name: 'Şagirdlər',
    completion: 90,
  },
  {
    id: '4',
    name: 'İnfrastruktur',
    completion: 75,
  },
];

export const mockDeadlineItems: DeadlineItem[] = [
  {
    id: '1',
    title: 'Hesabat 1',
    deadline: '2024-06-30',
    status: 'pending',
  },
  {
    id: '2',
    title: 'Hesabat 2',
    deadline: '2024-07-15',
    status: 'completed',
  },
  {
    id: '3',
    title: 'Hesabat 3',
    deadline: '2024-08-01',
    status: 'pending',
  },
];

export const mockPendingApprovals: PendingApproval[] = [
  {
    id: '1',
    title: 'Təmir hesabatı',
    school: '1 nömrəli məktəb',
    date: '2024-05-20',
  },
  {
    id: '2',
    title: 'Müəllim ərizəsi',
    school: '2 nömrəli məktəb',
    date: '2024-05-22',
  },
];

export const mockSchoolStats: SchoolStat[] = [
  {
    id: '1',
    name: '1 nömrəli məktəb',
    completionRate: 75,
  },
  {
    id: '2',
    name: '2 nömrəli məktəb',
    completionRate: 85,
  },
  {
    id: '3',
    name: '3 nömrəli məktəb',
    completionRate: 60,
  },
];

export const mockSectorStats: SectorStat[] = [
  {
    id: '1',
    name: 'Sektor 1',
    completionRate: 80,
  },
  {
    id: '2',
    name: 'Sektor 2',
    completionRate: 70,
  },
  {
    id: '3',
    name: 'Sektor 3',
    completionRate: 90,
  },
];

export const mockSectorFormItems: FormItem[] = [
  {
    id: '1',
    name: 'Bölgə məlumatları',
    status: 'pending' as const,
    submissions: 85,
    completion: 75,
    deadline: '2024-12-31T23:59:59Z'
  },
  {
    id: '2',
    name: 'Məktəb siyahısı',
    status: 'approved' as const,
    submissions: 120,
    completion: 90,
    deadline: '2024-11-30T23:59:59Z'
  },
  {
    id: '3',
    name: 'Müəllim hesabatı',
    status: 'rejected' as const,
    submissions: 65,
    completion: 45,
    deadline: '2024-10-31T23:59:59Z'
  },
  {
    id: '4',
    name: 'Şagird statistikası',
    status: 'pending' as const,
    submissions: 95,
    completion: 80,
    deadline: '2024-12-15T23:59:59Z'
  },
  {
    id: '5',
    name: 'Texniki avadanlıq',
    status: 'approved' as const,
    submissions: 75,
    completion: 85,
    deadline: '2024-11-15T23:59:59Z'
  },
  {
    id: '6',
    name: 'Məlumat təhlükəsizliyi',
    status: 'pending' as const,
    submissions: 55,
    completion: 70,
    deadline: '2024-12-20T23:59:59Z'
  }
];

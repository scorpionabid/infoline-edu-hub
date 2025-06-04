
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
    completionRate: 80,
    status: 'active'
  },
  {
    id: '2',
    name: 'Müəllimlər',
    completionRate: 65,
    status: 'active'
  },
  {
    id: '3',
    name: 'Şagirdlər',
    completionRate: 90,
    status: 'active'
  },
  {
    id: '4',
    name: 'İnfrastruktur',
    completionRate: 75,
    status: 'active'
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
    name: 'Təmir hesabatı',
    school: '1 nömrəli məktəb',
    date: '2024-05-20',
    description: 'Təmir hesabatı təsdiqi gözləyir',
    status: 'pending'
  },
  {
    id: '2',
    name: 'Müəllim ərizəsi',
    school: '2 nömrəli məktəb',
    date: '2024-05-22',
    description: 'Müəllim ərizəsi təsdiqi gözləyir',
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


import { 
  SuperAdminDashboardData,
  RegionAdminDashboardData,
  SectorAdminDashboardData,
  SchoolAdminDashboardData,
  DashboardNotification
} from '@/types/dashboard';
import { FormStatus } from '@/types/form';

// Mock notifications
const mockNotifications: DashboardNotification[] = [
  {
    id: '1',
    title: 'Yeni kateqoriya əlavə edildi',
    message: 'Riyaziyyat kateqoriyası SuperAdmin tərəfindən əlavə edildi.',
    date: '2023-06-01T09:30:00',
    read: false,
    type: 'category'
  },
  {
    id: '2',
    title: 'Yeni məktəb əlavə edildi',
    message: '123 nömrəli məktəb sistemə əlavə edildi.',
    date: '2023-06-01T10:15:00',
    read: true,
    type: 'school'
  },
  {
    id: '3',
    title: 'Məlumat təsdiqləndi',
    message: 'Şagird sayı məlumatları sektor admini tərəfindən təsdiqləndi.',
    date: '2023-06-01T11:45:00',
    read: false,
    type: 'approval'
  }
];

// Mock SuperAdmin data
export const createMockSuperAdminData = (): SuperAdminDashboardData => ({
  stats: {
    regions: 10,
    sectors: 45,
    schools: 250,
    users: 350
  },
  formsByStatus: {
    pending: 48,
    approved: 120,
    rejected: 15,
    total: 183
  },
  completionRate: 67,
  pendingApprovals: [
    { id: '1', title: 'Şagird sayı', school: 'Məktəb 123', submittedAt: '2023-06-01T09:30:00' },
    { id: '2', title: 'Müəllim məlumatları', school: 'Məktəb 45', submittedAt: '2023-06-01T10:15:00' },
    { id: '3', title: 'Sinif otaqları', school: 'Məktəb 67', submittedAt: '2023-06-01T11:45:00' }
  ],
  regions: [
    { id: '1', name: 'Bakı', schoolCount: 50, sectorCount: 5, completionRate: 75 },
    { id: '2', name: 'Sumqayıt', schoolCount: 30, sectorCount: 3, completionRate: 68 },
    { id: '3', name: 'Gəncə', schoolCount: 25, sectorCount: 3, completionRate: 82 }
  ],
  notifications: mockNotifications,
  chartData: {
    schoolsByRegion: [
      { name: 'Bakı', value: 50 },
      { name: 'Sumqayıt', value: 30 },
      { name: 'Gəncə', value: 25 }
    ],
    completionByCategory: [
      { name: 'Şagird Sayı', value: 85 },
      { name: 'Müəllim Məlumatları', value: 65 },
      { name: 'Maddi-Texniki Baza', value: 72 }
    ]
  }
});

// Mock RegionAdmin data
export const createMockRegionAdminData = (): RegionAdminDashboardData => ({
  stats: [
    { label: 'Sectors', value: 5 },
    { label: 'Schools', value: 50 },
    { label: 'Users', value: 80 }
  ],
  completionRate: 72,
  pendingApprovals: [
    { id: '1', title: 'Şagird sayı', school: 'Məktəb 123', submittedAt: '2023-06-01T09:30:00' },
    { id: '2', title: 'Müəllim məlumatları', school: 'Məktəb 45', submittedAt: '2023-06-01T10:15:00' }
  ],
  sectorCompletions: [
    { id: '1', name: 'Sektor A', schoolCount: 15, completionRate: 85 },
    { id: '2', name: 'Sektor B', schoolCount: 10, completionRate: 65 },
    { id: '3', name: 'Sektor C', schoolCount: 12, completionRate: 78 },
    { id: '4', name: 'Sektor D', schoolCount: 8, completionRate: 90 },
    { id: '5', name: 'Sektor E', schoolCount: 5, completionRate: 45 }
  ],
  categories: [
    { id: '1', name: 'Şagird Sayı', status: 'active', deadline: '2023-06-15', completionRate: 85, columnCount: 8 },
    { id: '2', name: 'Müəllim Məlumatları', status: 'active', deadline: '2023-06-20', completionRate: 65, columnCount: 12 },
    { id: '3', name: 'Maddi-Texniki Baza', status: 'upcoming', deadline: '2023-07-01', completionRate: 32, columnCount: 15 }
  ],
  notifications: mockNotifications
});

// Mock SectorAdmin data
export const createMockSectorAdminData = (): SectorAdminDashboardData => ({
  stats: [
    { label: 'Schools', value: 15 },
    { label: 'Users', value: 25 },
    { label: 'Completion', value: '85%' }
  ],
  completionRate: 85,
  pendingItems: [
    { id: '1', title: 'Şagird sayı', school: 'Məktəb 123', submitDate: '2023-06-01T09:30:00' },
    { id: '2', title: 'Müəllim məlumatları', school: 'Məktəb 45', submitDate: '2023-06-01T10:15:00' }
  ],
  schoolsStats: [
    { id: '1', name: 'Məktəb 123', completionRate: 95, pendingCount: 1 },
    { id: '2', name: 'Məktəb 45', completionRate: 78, pendingCount: 2 },
    { id: '3', name: 'Məktəb 67', completionRate: 85, pendingCount: 0 },
    { id: '4', name: 'Məktəb 89', completionRate: 92, pendingCount: 0 },
    { id: '5', name: 'Məktəb 101', completionRate: 68, pendingCount: 3 }
  ],
  activityLog: [
    { id: '1', action: 'submit', user: 'Anar Məmmədov', target: 'Şagird sayı', time: '2023-06-01T09:30:00' },
    { id: '2', action: 'approve', user: 'Sektor Admin', target: 'Müəllim məlumatları', time: '2023-06-01T10:15:00' },
    { id: '3', action: 'reject', user: 'Sektor Admin', target: 'Sinif otaqları', time: '2023-06-01T11:45:00' }
  ],
  notifications: mockNotifications
});

// Mock SchoolAdmin data
export const createMockSchoolAdminData = (): SchoolAdminDashboardData => ({
  forms: { 
    pending: 3, 
    approved: 8, 
    rejected: 1, 
    dueSoon: 2, 
    overdue: 0, 
    total: 14 
  },
  completionRate: 75,
  pendingForms: [
    { 
      id: '1', 
      title: 'Şagird sayı', 
      status: FormStatus.PENDING,
      completionPercentage: 100, 
      dueDate: '2023-06-15',
      category: 'Ümumi məlumatlar',
      date: '2023-06-01'
    },
    { 
      id: '2', 
      title: 'Müəllim məlumatları', 
      status: FormStatus.PENDING,
      completionPercentage: 85, 
      dueDate: '2023-06-20',
      category: 'Kadr məlumatları',
      date: '2023-06-05'
    },
    { 
      id: '3', 
      title: 'Sinif otaqları', 
      status: FormStatus.DUE_SOON,
      completionPercentage: 60, 
      dueDate: '2023-06-10',
      category: 'İnfrastruktur',
      date: '2023-06-03'
    }
  ],
  notifications: mockNotifications
});

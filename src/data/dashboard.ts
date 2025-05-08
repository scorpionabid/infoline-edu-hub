
import { 
  RegionStat, 
  SectorStat, 
  SchoolStat, 
  CategoryStat, 
  ChartData,
  DashboardFormStats,
  DashboardNotification,
  PendingApproval
} from '@/types/dashboard';

// Sample dashboard data
export const dashboardMockData = {
  notifications: [
    {
      id: '1',
      title: 'Yeni məlumat əlavə edildi',
      message: 'ABC Məktəbindən yeni məlumatlar təsdiq gözləyir',
      timestamp: '2025-04-28T10:15:00Z',
      type: 'info',
      isRead: false
    },
    {
      id: '2',
      title: 'Son tarix yaxınlaşır',
      message: 'İllik hesabat üçün son 3 gün',
      timestamp: '2025-04-28T09:30:00Z',
      type: 'warning',
      isRead: false
    },
    {
      id: '3',
      title: 'Hesabat təsdiqləndi',
      message: 'Rüblük hesabat təsdiqləndi',
      timestamp: '2025-04-27T14:45:00Z',
      type: 'success',
      isRead: true
    }
  ] as DashboardNotification[],
  
  formStats: {
    pending: 12,
    approved: 45,
    rejected: 3,
    draft: 7,
    total: 67,
    dueSoon: 5,
    overdue: 2
  } as DashboardFormStats,
  
  regions: [
    { id: '1', name: 'Bakı', sectorCount: 12, schoolCount: 148, completionRate: 78 },
    { id: '2', name: 'Sumqayıt', sectorCount: 4, schoolCount: 42, completionRate: 65 },
    { id: '3', name: 'Gəncə', sectorCount: 3, schoolCount: 36, completionRate: 82 },
    { id: '4', name: 'Lənkəran', sectorCount: 2, schoolCount: 28, completionRate: 54 }
  ] as RegionStat[],
  
  sectors: [
    { id: '1', name: 'Sabunçu', schoolCount: 42, completionRate: 72 },
    { id: '2', name: 'Yasamal', schoolCount: 38, completionRate: 85 },
    { id: '3', name: 'Binəqədi', schoolCount: 45, completionRate: 63 },
    { id: '4', name: 'Nizami', schoolCount: 35, completionRate: 79 }
  ] as SectorStat[],
  
  schools: [
    { id: '1', name: 'Məktəb #12', completionRate: 95, pendingCount: 0 },
    { id: '2', name: 'Məktəb #24', completionRate: 68, pendingCount: 3 },
    { id: '3', name: 'Məktəb #148', completionRate: 75, pendingCount: 1 },
    { id: '4', name: 'Məktəb #220', completionRate: 42, pendingCount: 5 }
  ] as SchoolStat[],
  
  categories: [
    { id: '1', name: 'Maddi-texniki baza', completionRate: 86, status: 'active', deadline: '2025-05-15' },
    { id: '2', name: 'Müəllim heyəti', completionRate: 92, status: 'active', deadline: '2025-05-10' },
    { id: '3', name: 'Tələbə statistikası', completionRate: 78, status: 'active', deadline: '2025-04-30' },
    { id: '4', name: 'Maliyyə hesabatı', completionRate: 45, status: 'active', deadline: '2025-05-20' }
  ] as CategoryStat[],
  
  chartData: [
    { name: 'Təsdiqlənib', value: 45, color: '#16A34A' },
    { name: 'Gözləyir', value: 12, color: '#F59E0B' },
    { name: 'Rədd edilib', value: 3, color: '#EF4444' },
    { name: 'Qaralama', value: 7, color: '#6B7280' }
  ] as ChartData[],
  
  pendingApprovals: [
    {
      id: '1',
      schoolId: 's1',
      schoolName: 'Məktəb #12',
      categoryId: 'c1',
      categoryName: 'Maddi-texniki baza',
      status: 'pending',
      createdAt: '2025-04-26T14:23:00Z',
      submittedAt: '2025-04-26T14:23:00Z',
      count: 3
    },
    {
      id: '2',
      schoolId: 's2',
      schoolName: 'Məktəb #24',
      categoryId: 'c2',
      categoryName: 'Müəllim heyəti',
      status: 'pending',
      createdAt: '2025-04-25T10:15:00Z',
      submittedAt: '2025-04-25T10:15:00Z',
      count: 1
    }
  ] as PendingApproval[],
  
  completionRate: 72,
  totalSchools: 254,
  totalSectors: 21
};


import { getBaseData } from './baseProvider';
import { getMockNotifications, getMockRegions, getMockSectors } from '../mockDashboardData';
import { SuperAdminDashboardData } from '@/types/dashboard';

export function getSuperAdminData(): SuperAdminDashboardData {
  const baseData = getBaseData();
  const mockRegions = getMockRegions();
  const mockSectors = getMockSectors();
  
  return {
    ...baseData,
    regions: mockRegions.length,
    sectors: mockSectors.length,
    schools: baseData.totalSchools,
    users: 50,
    completionRate: 78,
    pendingApprovals: 15,
    notifications: getMockNotifications(),
    pendingSchools: 8,
    approvedSchools: 42,
    rejectedSchools: 5,
    activityData: [
      { id: "1", action: "Təsdiqləndi", actor: "Admin", target: "Məktəb #1", time: "2 saat öncə" },
      { id: "2", action: "Rədd edildi", actor: "Admin", target: "Məktəb #3", time: "3 saat öncə" },
      { id: "3", action: "Məlumat əlavə edildi", actor: "Sektor admini", target: "Kateqoriya #1", time: "4 saat öncə" },
      { id: "4", action: "Hesabat yaradıldı", actor: "SuperAdmin", target: "Aylıq hesabat", time: "5 saat öncə" },
      { id: "5", action: "İstifadəçi əlavə edildi", actor: "SuperAdmin", target: "Region admini", time: "1 gün öncə" }
    ],
    statusData: {
      completed: 42,
      pending: 8,
      rejected: 5,
      notStarted: 3
    },
    regionCompletionData: [
      { name: 'Bakı', completed: 85 },
      { name: 'Sumqayıt', completed: 72 },
      { name: 'Gəncə', completed: 65 },
      { name: 'Quba', completed: 58 },
      { name: 'Lənkəran', completed: 63 }
    ],
    sectorCompletionData: [
      { name: 'Sektor A', completed: 92 },
      { name: 'Sektor B', completed: 78 },
      { name: 'Sektor C', completed: 56 },
      { name: 'Sektor D', completed: 81 },
      { name: 'Sektor E', completed: 69 }
    ],
    categoryCompletionData: [
      { name: 'Ümumi məlumat', completed: 95 },
      { name: 'Təhsil prosesi', completed: 82 },
      { name: 'Maddi-texniki baza', completed: 71 },
      { name: 'Müəllim heyəti', completed: 88 },
      { name: 'Şagird statistikası', completed: 79 }
    ]
  };
}

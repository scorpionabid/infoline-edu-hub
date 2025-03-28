
import { getBaseData } from './baseProvider';
import { getMockNotifications, getMockRegions, getMockSectors } from '../mockDashboardData';
import { SuperAdminDashboardData } from '@/types/dashboard';

export function getSuperAdminData(): SuperAdminDashboardData {
  const baseData = getBaseData();
  const mockRegions = getMockRegions();
  const mockSectors = getMockSectors();
  const notifications = getMockNotifications().map(n => ({
    ...n, 
    time: n.createdAt || new Date().toISOString() 
  }));
  
  return {
    ...baseData,
    regions: mockRegions.length,
    sectors: mockSectors.length,
    schools: baseData.totalSchools || 50,
    users: 50,
    completionRate: 78,
    pendingApprovals: 15,
    notifications,
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
      { region: 'Bakı', completion: 85 },
      { region: 'Sumqayıt', completion: 72 },
      { region: 'Gəncə', completion: 65 },
      { region: 'Quba', completion: 58 },
      { region: 'Lənkəran', completion: 63 }
    ],
    sectorCompletionData: [
      { sector: 'Sektor A', completion: 92 },
      { sector: 'Sektor B', completion: 78 },
      { sector: 'Sektor C', completion: 56 },
      { sector: 'Sektor D', completion: 81 },
      { sector: 'Sektor E', completion: 69 }
    ],
    categoryCompletionData: [
      { category: 'Ümumi məlumat', completion: 95 },
      { category: 'Təhsil prosesi', completion: 82 },
      { category: 'Maddi-texniki baza', completion: 71 },
      { category: 'Müəllim heyəti', completion: 88 },
      { category: 'Şagird statistikası', completion: 79 }
    ]
  };
}

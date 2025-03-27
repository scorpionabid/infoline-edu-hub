
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
      { id: "2", action: "Rədd edildi", actor: "Admin", target: "Məktəb #3", time: "3 saat öncə" }
    ],
    statusData: {
      completed: 42,
      pending: 8,
      rejected: 5,
      notStarted: 3
    }
  };
}

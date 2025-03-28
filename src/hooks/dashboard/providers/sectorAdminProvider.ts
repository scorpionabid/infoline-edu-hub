
import { getBaseData } from './baseProvider';
import { getMockNotifications } from '../mockDashboardData';
import { SectorAdminDashboardData } from '@/types/dashboard';

export function getSectorAdminData(): SectorAdminDashboardData {
  const baseData = getBaseData();
  const notifications = getMockNotifications().map(n => ({
    ...n, 
    time: n.createdAt || new Date().toISOString() 
  }));
  
  return {
    ...baseData,
    sectorName: "Nəsimi",
    regionName: "Bakı",
    schools: 8,
    completionRate: 72,
    pendingApprovals: 5,
    pendingSchools: 3,
    approvedSchools: 12,
    rejectedSchools: 2,
    notifications
  };
}

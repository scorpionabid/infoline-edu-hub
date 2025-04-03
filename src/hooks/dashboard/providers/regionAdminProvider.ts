import { getBaseData } from './baseProvider';
import { getMockNotifications } from '../mockDashboardData';
import { RegionAdminDashboardData } from '@/types/dashboard';

export function getRegionAdminData(): RegionAdminDashboardData {
  const baseData = getBaseData();
  const notifications = getMockNotifications().map(n => ({
    ...n, 
    time: n.createdAt || new Date().toISOString() 
  }));
  
  return {
    ...baseData,
    regionName: "Bakı",
    sectors: 5,
    schools: 15,
    users: 30,
    completionRate: 65,
    pendingApprovals: 10,
    pendingSchools: 6,
    approvedSchools: 20,
    rejectedSchools: 3,
    notifications,
    categories: [
      { name: "Tədris planı", completionRate: 85, color: "bg-blue-500" },
      { name: "Müəllim heyəti", completionRate: 70, color: "bg-green-500" },
      { name: "İnfrastruktur", completionRate: 55, color: "bg-purple-500" },
      { name: "Maliyyə", completionRate: 40, color: "bg-amber-500" }
    ],
    sectorCompletions: [
      { name: "Nəsimi", completionRate: 80 },
      { name: "Binəqədi", completionRate: 65 },
      { name: "Yasamal", completionRate: 75 },
      { name: "Sabunçu", completionRate: 60 }
    ]
  };
}

export const getRegionAdminDashboardData = (userId: string): RegionAdminDashboardData => {
  // Base data əldə edirik
  const baseData = getBaseDashboardData();

  // Region Admin xüsusi dataları əlavə edirik
  return {
    ...baseData,
    regionName: "Bakı şəhəri",
    sectors: 5,
    schools: 72,
    users: 86,
    approvalRate: 67,
    completionRate: 72,
    pendingApprovals: 18,
    pendingSchools: 6,
    approvedSchools: 66,
    rejectedSchools: 0,
    categories: [
      { name: "Şagirdlər", completionRate: 84, color: "#10B981" },
      { name: "Müəllimlər", completionRate: 65, color: "#F59E0B" },
      { name: "İnfrastruktur", completionRate: 42, color: "#8B5CF6" }
    ]
  };
};

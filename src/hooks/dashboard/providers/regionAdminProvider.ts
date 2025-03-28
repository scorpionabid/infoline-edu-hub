
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

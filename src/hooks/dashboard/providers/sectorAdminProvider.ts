
import { SectorAdminDashboardData } from '@/types/dashboard';
import { getBaseDashboardData } from './baseProvider';
import { 
  getMockRecentForms, 
  getMockPendingForms, 
  getMockUpcomingDeadlines 
} from './utils';

export const getSectorAdminDashboardData = (sectorId?: string): SectorAdminDashboardData => {
  const baseData = getBaseDashboardData();
  const sectorName = getSectorName(sectorId || '1');
  
  return {
    ...baseData,
    sectorName,
    regionName: 'Bakı',
    schools: 28,
    users: 35,
    completionRate: 82,
    pendingApprovals: 8,
    pendingSchools: 3,
    approvedSchools: 24,
    rejectedSchools: 1,
    statusData: {
      completed: 24,
      pending: 3,
      rejected: 1,
      notStarted: 0
    },
    recentForms: getMockRecentForms(),
    pendingForms: getMockPendingForms(),
    upcomingDeadlines: getMockUpcomingDeadlines(),
    chartData: {
      labels: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May'],
      datasets: [
        {
          label: 'Məlumat toplayan məktəblər',
          data: [15, 18, 22, 26, 28],
          backgroundColor: ['rgba(59, 130, 246, 0.5)'],
          borderColor: ['rgb(59, 130, 246)'],
          borderWidth: 1,
        },
      ],
    },
  };
};

// Köməkçi funksiyalar
const getSectorName = (sectorId: string): string => {
  const sectorsMap = {
    '1': 'Binəqədi',
    '2': 'Yasamal',
    '3': 'Xətai'
  };
  
  return (sectorsMap as {[key: string]: string})[sectorId] || 'Unknown sector';
};

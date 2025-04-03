
import { RegionAdminDashboardData } from '@/types/dashboard';
import { getBaseDashboardData, getFormStatusCounts } from './baseProvider';

export const getRegionAdminDashboardData = (regionId?: string): RegionAdminDashboardData => {
  const baseData = getBaseDashboardData();
  const regionName = getRegionName(regionId || '1');

  return {
    regionName,
    sectors: 8,
    schools: 120,
    users: 180,
    approvalRate: 92, // Təsdiq faizi
    completionRate: 78,
    pendingApprovals: 15,
    pendingSchools: 5,
    approvedSchools: 110,
    rejectedSchools: 5,
    notifications: baseData.notifications || [],
    activityData: baseData.activityData || [],
    statusData: {
      completed: 110,
      pending: 5,
      rejected: 5,
      notStarted: 0
    },
    chartData: {
      labels: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May'],
      datasets: [
        {
          label: 'Məlumat toplamış məktəblər',
          data: [70, 80, 90, 100, 110],
          backgroundColor: ['rgba(59, 130, 246, 0.5)'],
          borderColor: ['rgb(59, 130, 246)'],
          borderWidth: 1,
        },
      ],
    },
    categoryCompletionData: [
      { name: 'Şagird məlumatları', completed: 115, total: 120, percentage: 96 },
      { name: 'Müəllim məlumatları', completed: 105, total: 120, percentage: 88 },
      { name: 'İnfrastruktur', completed: 95, total: 120, percentage: 79 },
      { name: 'Maliyyə', completed: 80, total: 120, percentage: 67 }
    ],
    sectorCompletions: [
      { name: 'Binəqədi', completion: 92 },
      { name: 'Yasamal', completion: 85 },
      { name: 'Nəsimi', completion: 78 },
      { name: 'Səbail', completion: 70 }
    ]
  };
};

// Helper functions
const getRegionName = (regionId: string): string => {
  const regionsMap = {
    '1': 'Bakı',
    '2': 'Sumqayıt',
    '3': 'Gəncə'
  };
  
  return (regionsMap as {[key: string]: string})[regionId] || 'Unknown region';
};

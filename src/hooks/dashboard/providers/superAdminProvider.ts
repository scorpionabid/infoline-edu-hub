
import { FormItem, FormStatus } from '@/types/form';
import { SuperAdminDashboardData } from '@/types/dashboard';
import { getBaseDashboardData } from './baseProvider';
import { 
  getCategoryCompletionData, 
  getMockRecentForms, 
  getMockPendingForms 
} from './utils';

export const getSuperAdminDashboardData = (): SuperAdminDashboardData => {
  const baseData = getBaseDashboardData();
  
  // Super Admin üçün əlavə məlumatlar
  return {
    ...baseData,
    regions: 10,
    sectors: 35,
    schools: 650,
    users: 720,
    completionRate: 85,
    pendingApprovals: 28,
    pendingSchools: 15,
    approvedSchools: 625,
    rejectedSchools: 10,
    statusData: {
      completed: 625,
      pending: 15,
      rejected: 10,
      notStarted: 0
    },
    categoryCompletionData: [
      { name: 'Şagird məlumatları', completed: 600, total: 650, percentage: 92 },
      { name: 'Müəllim məlumatları', completed: 580, total: 650, percentage: 89 },
      { name: 'İnfrastruktur', completed: 520, total: 650, percentage: 80 },
      { name: 'Maliyyə', completed: 450, total: 650, percentage: 69 }
    ],
    recentForms: getMockRecentForms(),
    pendingForms: getMockPendingForms(),
    chartData: {
      labels: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May'],
      datasets: [
        {
          label: 'Məlumat toplayan məktəblər',
          data: [450, 500, 580, 620, 650],
          backgroundColor: ['rgba(59, 130, 246, 0.5)'],
          borderColor: ['rgb(59, 130, 246)'],
          borderWidth: 1,
        },
      ],
    },
  };
};

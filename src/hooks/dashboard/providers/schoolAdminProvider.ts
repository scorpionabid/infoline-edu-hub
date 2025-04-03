
import { SchoolAdminDashboardData } from '@/types/dashboard';
import { FormItem, FormStatus } from '@/types/form';
import { getBaseDashboardData } from './baseProvider';
import { 
  getMockRecentForms, 
  getMockPendingForms, 
  getMockUpcomingDeadlines 
} from './utils';

export const getSchoolAdminDashboardData = (schoolId?: string): SchoolAdminDashboardData => {
  const baseData = getBaseDashboardData();
  const schoolName = getSchoolName(schoolId || '1');
  
  // School Admin için özelleştirilmiş dashboard verileri
  return {
    ...baseData,
    schoolName,
    sectorName: 'Binəqədi',
    regionName: 'Bakı',
    completionRate: 75,
    completedForms: 9,
    totalForms: 12,
    forms: {
      pending: 2,
      approved: 9,
      rejected: 0,
      dueSoon: 1,
      overdue: 0
    },
    recentForms: getMockRecentForms(),
    pendingForms: getMockPendingForms(),
    upcomingDeadlines: getMockUpcomingDeadlines(),
    statusData: {
      completed: 9,
      pending: 2,
      rejected: 0,
      notStarted: 1
    },
    chartData: {
      labels: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May'],
      datasets: [
        {
          label: 'Tamamlanma faizi',
          data: [40, 55, 65, 70, 75],
          backgroundColor: ['rgba(59, 130, 246, 0.5)'],
          borderColor: ['rgb(59, 130, 246)'],
          borderWidth: 1,
        },
      ],
    }
  };
};

// Köməkçi funksiyalar
const getSchoolName = (schoolId: string): string => {
  const schoolsMap = {
    '1': '20 saylı məktəb',
    '2': '158 saylı məktəb',
    '3': '245 saylı məktəb'
  };
  
  return (schoolsMap as {[key: string]: string})[schoolId] || 'Unknown school';
};


import { ChartData } from '@/types/dashboard';
import { getMonthlyNewUsersForChart } from './userService';
import { getSchoolCountByRegionForChart } from './regionService';
import { getCategoryCompletionData } from './categoryService';

// Qrafikləri əldə et
export const fetchDashboardChartData = async (): Promise<ChartData> => {
  try {
    const [activityData, regionSchoolsData, categoryCompletionData] = await Promise.all([
      getMonthlyNewUsersForChart(),
      getSchoolCountByRegionForChart(),
      getCategoryCompletionData()
    ]);

    return {
      activityData: activityData.map(item => ({
        name: item.month,
        value: item.value
      })),
      regionSchoolsData,
      categoryCompletionData
    };
  } catch (error) {
    console.error('Chart məlumatları əldə edilərkən xəta:', error);
    return {
      activityData: [],
      regionSchoolsData: [],
      categoryCompletionData: []
    };
  }
};

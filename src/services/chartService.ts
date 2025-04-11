
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
      categoryCompletionData: categoryCompletionData.map(item => ({
        name: item.name,
        value: item.completed // completed field-i value-ya çeviririk
      }))
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

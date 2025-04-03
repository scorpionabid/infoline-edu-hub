import { mockCategories } from '@/data/mock/mockCategories';
import { 
  getMockNotifications, 
  getMockRegions, 
  getMockSectors, 
  getMockSchools 
} from '../mockDashboardData';
import { DashboardData } from '@/types/dashboard';
import { createSafeFormItems, transformDeadlineToString, validateMockCategories } from './utils';

export function getBaseData(): DashboardData {
  const mockSchools = getMockSchools();
  const mockRegions = getMockRegions();
  const mockSectors = getMockSectors();
  
  console.log('getBaseData çağırıldı');
  validateMockCategories();
  
  const totalSchools = mockSchools.length;
  const activeSchools = mockSchools.filter(school => school.status === 'active').length;
  
  const pendingFormItems = createSafeFormItems(mockCategories);
  
  console.log('pendingFormItems yaradıldı:', pendingFormItems.length);
  
  let upcomingDeadlines: { category: string; date: string }[] = [];
  
  try {
    upcomingDeadlines = Array.isArray(mockCategories) 
      ? mockCategories
        .filter(category => {
          const hasDeadline = category.deadline !== undefined && category.deadline !== null && category.deadline !== '';
          if (!hasDeadline) {
            console.log(`Kateqoriya "${category.name}" deadline xüsusiyyətinə malik deyil`);
          }
          return hasDeadline;
        })
        .slice(0, 5)
        .map(category => {
          return {
            category: category.name,
            date: transformDeadlineToString(category.deadline)
          };
        })
      : [];
    
    console.log('upcomingDeadlines yaradıldı:', upcomingDeadlines.length);
  } catch (error) {
    console.error('upcomingDeadlines yaradılması zamanı xəta:', error);
  }
  
  let regionalStats = mockRegions.map(region => {
    return {
      region: region.name,
      approved: Math.floor(Math.random() * 50),
      pending: Math.floor(Math.random() * 30),
      rejected: Math.floor(Math.random() * 10)
    };
  });
  
  let sectorStats = mockSectors.map(sector => {
    return {
      sector: sector.name,
      approved: Math.floor(Math.random() * 30),
      pending: Math.floor(Math.random() * 20),
      rejected: Math.floor(Math.random() * 5)
    };
  });
  
  const result: DashboardData = {
    totalSchools,
    activeSchools,
    pendingForms: pendingFormItems,
    upcomingDeadlines,
    regionalStats,
    sectorStats
  };
  
  console.log('getBaseData bitdi, nəticə hazırdır');
  return result;
}

export const getBaseDashboardData = (): DashboardData => {
  return {
    notifications: mockNotifications,
    isLoading: false,
    error: null,
    totalSchools: 0,
    activeSchools: 0,
    pendingForms: [
      {
        id: "1",
        title: "Müəllim məlumatları",
        status: "pending" as FormStatus,
        completionPercentage: 45,
        category: "Kadrlar"
      },
      {
        id: "2",
        title: "Infrastruktur məlumatları",
        status: "pending" as FormStatus,
        completionPercentage: 30,
        category: "İnfrastruktur"
      }
    ],
    upcomingDeadlines: [
      {
        id: "3",
        title: "Şagird məlumatları",
        status: "dueSoon" as FormStatus,
        completionPercentage: 75,
        category: "Şagirdlər",
        deadline: "2023-09-20T23:59:59Z"
      },
      {
        id: "4",
        title: "Maliyyə məlumatları",
        status: "due" as FormStatus,
        completionPercentage: 15,
        category: "Maliyyə",
        deadline: "2023-09-25T23:59:59Z"
      }
    ]
  };
};

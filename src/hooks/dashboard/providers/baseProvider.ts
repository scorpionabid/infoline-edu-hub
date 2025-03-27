
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

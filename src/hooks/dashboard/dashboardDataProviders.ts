
import { mockCategories } from '@/data/mock/mockCategories';
import { MockCategory } from '@/types/category';
import { 
  DashboardData, 
  SuperAdminDashboardData, 
  RegionAdminDashboardData, 
  SectorAdminDashboardData,
  SchoolAdminDashboardData,
  FormItem
} from '@/types/dashboard';
import { 
  getMockNotifications, 
  getMockRegions, 
  getMockSectors, 
  getMockSchools, 
  getMockRecentForms 
} from './mockDashboardData';
import { FormStatus } from '@/types/form';

export function transformDeadlineToString(deadline: string | Date | undefined): string {
  if (!deadline) {
    console.log('Deadline məlumatı təqdim edilməyib');
    return '';
  }
  
  try {
    return typeof deadline === 'string' ? deadline : deadline.toISOString();
  } catch (error) {
    console.error('Deadline çevirmə xətası:', error);
    return '';
  }
}

export function createSafeFormItems(categoryList: MockCategory[]): FormItem[] {
  if (!Array.isArray(categoryList)) {
    console.warn('Kateqoriyalar massiv deyil', categoryList);
    return [];
  }
  
  if (categoryList.length === 0) {
    console.warn('Kateqoriyalar massivi boşdur');
    return [];
  }
  
  console.log(`${categoryList.length} kateqoriya işlənir, ilk element:`, categoryList[0]);
  
  return categoryList.map(category => {
    if (!category) {
      console.error('Kateqoriya undefined və ya null', category);
      return {
        id: `temp-${Math.random().toString(36).substr(2, 9)}`,
        title: 'Xəta: namə\'lum kateqoriya',
        category: 'Namə\'lum',
        status: 'pending' as FormStatus,
        completionPercentage: 0,
        deadline: ''
      };
    }
    
    const deadline = category.deadline ? transformDeadlineToString(category.deadline) : '';
    console.log(`Kateqoriya "${category.name}" üçün deadline: ${deadline}`);
    
    return {
      id: category.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
      title: category.name || 'Unnamed Category',
      category: category.name || 'Unnamed Category',
      status: 'pending' as FormStatus,
      completionPercentage: Math.floor(Math.random() * 100),
      deadline: deadline
    };
  });
}

export function getBaseData(): DashboardData {
  const mockSchools = getMockSchools();
  const mockRegions = getMockRegions();
  const mockSectors = getMockSectors();
  
  console.log('getBaseData çağırıldı');
  console.log('mockCategories tipi:', typeof mockCategories);
  console.log('mockCategories massiv?', Array.isArray(mockCategories));
  console.log('mockCategories uzunluğu:', mockCategories?.length || 'mövcud deyil');
  
  if (Array.isArray(mockCategories) && mockCategories.length > 0) {
    console.log('İlk kateqoriya nümunəsi:', mockCategories[0]);
  } else {
    console.error('mockCategories data problemi');
  }
  
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

export function getSuperAdminData(): SuperAdminDashboardData {
  const baseData = getBaseData();
  const mockRegions = getMockRegions();
  const mockSectors = getMockSectors();
  
  return {
    ...baseData,
    regions: mockRegions.length,
    sectors: mockSectors.length,
    schools: baseData.totalSchools,
    users: 50,
    completionRate: 78,
    pendingApprovals: 15,
    notifications: getMockNotifications(),
    pendingSchools: 8,
    approvedSchools: 42,
    rejectedSchools: 5,
    activityData: [
      { id: "1", action: "Təsdiqləndi", actor: "Admin", target: "Məktəb #1", time: "2 saat öncə" },
      { id: "2", action: "Rədd edildi", actor: "Admin", target: "Məktəb #3", time: "3 saat öncə" }
    ],
    statusData: {
      completed: 42,
      pending: 8,
      rejected: 5,
      notStarted: 3
    }
  };
}

export function getRegionAdminData(): RegionAdminDashboardData {
  const baseData = getBaseData();
  
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
    notifications: getMockNotifications(),
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

export function getSectorAdminData(): SectorAdminDashboardData {
  const baseData = getBaseData();
  
  return {
    ...baseData,
    sectorName: "Nəsimi",
    regionName: "Bakı",
    schools: 8,
    completionRate: 72,
    pendingApprovals: 5,
    pendingSchools: 3,
    approvedSchools: 12,
    rejectedSchools: 2,
    notifications: getMockNotifications()
  };
}

export function getSchoolAdminData(): SchoolAdminDashboardData {
  const baseData = getBaseData();
  
  return {
    ...baseData,
    schoolName: "Şəhər Məktəbi #1",
    sectorName: "Nəsimi",
    regionName: "Bakı",
    forms: {
      pending: 3,
      approved: 10,
      rejected: 1,
      dueSoon: 2,
      overdue: 0
    },
    completionRate: 80,
    notifications: getMockNotifications(),
    categories: 5,
    totalForms: 15,
    completedForms: 10,
    rejectedForms: 2,
    dueDates: [
      { category: "Tədris planı", date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
      { category: "Maliyyə hesabatı", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    recentForms: getMockRecentForms()
  };
}

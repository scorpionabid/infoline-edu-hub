import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useCategories } from './useCategories';
import { useDataEntries } from './useDataEntries';
import { School } from '@/types/school';
import { useSchools } from './useSchools';
import { Notification, NotificationType } from '@/types/notification';
import { FormStatus } from '@/types/form';
import { 
  getMockCategoryCompletion,
  getMockRegionSchoolsData, 
  getMockActivityData,
  getMockNotifications,
  getMockForms,
  getMockSchools,
  getMockRegionalStats,
  getMockSectorStats,
  getMockDeadlines
} from '@/utils/dashboardUtils';

export interface FormItem {
  id: string;
  title: string;
  category: string;
  status: FormStatus;
  completionPercentage: number;
  deadline?: string;
}

export interface DashboardData {
  totalSchools: number;
  activeSchools: number;
  pendingForms: FormItem[];
  upcomingDeadlines: {
    category: string;
    date: string;
  }[];
  regionalStats: {
    region: string;
    approved: number;
    pending: number;
    rejected: number;
  }[];
  sectorStats: {
    sector: string;
    approved: number;
    pending: number;
    rejected: number;
  }[];
}

export interface SuperAdminDashboardData extends DashboardData {
  regions: number;
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  notifications: Notification[];
  activityData?: {
    id: string;
    action: string;
    actor: string;
    target: string;
    time: string;
  }[];
  pendingSchools?: number;
  approvedSchools?: number;
  rejectedSchools?: number;
  statusData?: {
    completed: number;
    pending: number;
    rejected: number;
    notStarted: number;
  };
}

export interface RegionAdminDashboardData extends DashboardData {
  regionName: string;
  sectors: number;
  schools: number;
  users: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  notifications: Notification[];
  categories: {
    name: string;
    completionRate: number;
    color: string;
  }[];
  sectorCompletions: {
    name: string;
    completionRate: number;
  }[];
}

export interface SectorAdminDashboardData extends DashboardData {
  sectorName: string;
  regionName: string;
  schools: number;
  completionRate: number;
  pendingApprovals: number;
  pendingSchools: number;
  approvedSchools: number;
  rejectedSchools: number;
  notifications: Notification[];
}

export interface SchoolAdminDashboardData extends DashboardData {
  schoolName: string;
  sectorName: string;
  regionName: string;
  forms: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
  };
  completionRate: number;
  notifications: Notification[];
  categories?: number;
  totalForms?: number;
  completedForms?: number;
  rejectedForms?: number;
  dueDates?: Array<{
    category: string;
    date: string;
  }>;
  recentForms?: Array<FormItem>;
}

export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSchools: 0,
    activeSchools: 0,
    pendingForms: [],
    upcomingDeadlines: [],
    regionalStats: [],
    sectorStats: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [chartData, setChartData] = useState({
    activityData: [] as { name: string; value: number }[],
    regionSchoolsData: [] as { name: string; value: number }[],
    categoryCompletionData: [] as { name: string; completed: number }[]
  });
  
  const { t } = useLanguage();
  const { user } = useAuth();
  const { categories } = useCategories();
  const { dataEntries } = useDataEntries();
  const schoolsData = useSchools();
  
  const mockSchools: School[] = getMockSchools(4);

  const mockRegions = [
    { id: "1", name: "Bakı" },
    { id: "2", name: "Abşeron" },
    { id: "3", name: "Sumqayıt" }
  ];

  const mockSectors = [
    { id: "1", name: "Nəsimi", region_id: "1" },
    { id: "2", name: "Xırdalan", region_id: "2" },
    { id: "3", name: "28 May", region_id: "3" }
  ];

  const mockNotifications: Notification[] = getMockNotifications(2);

  const transformDeadlineToString = (deadline: string | Date | undefined): string => {
    if (!deadline) return '';
    return typeof deadline === 'string' ? deadline : deadline.toISOString();
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (user) {
        setUserRole(user.role);
      }
      
      const totalSchools = mockSchools.length;
      const activeSchools = mockSchools.filter(school => school.status === 'active').length;

      let pendingFormItems = categories.map(category => {
        return {
          id: category.id,
          title: category.name,
          category: category.name,
          status: 'pending' as FormStatus,
          completionPercentage: Math.floor(Math.random() * 100),
          deadline: transformDeadlineToString(category.deadline)
        };
      });

      let upcomingDeadlines = categories
        .filter(category => category.deadline)
        .slice(0, 5)
        .map(category => ({
          category: category.name,
          date: transformDeadlineToString(category.deadline)
        }));

      let regionalStats = getMockRegionalStats(mockRegions.map(r => r.name));
      let sectorStats = getMockSectorStats(mockSectors.map(s => s.name));

      const activityData = getMockActivityData();
      const regionSchoolsData = getMockRegionSchoolsData();
      const categoryCompletionData = getMockCategoryCompletion();

      setChartData({
        activityData,
        regionSchoolsData,
        categoryCompletionData
      });

      setDashboardData({
        totalSchools,
        activeSchools,
        pendingForms: pendingFormItems,
        upcomingDeadlines,
        regionalStats,
        sectorStats
      });

      if (userRole === 'superadmin') {
        const superAdminData: SuperAdminDashboardData = {
          ...dashboardData,
          regions: mockRegions.length,
          sectors: mockSectors.length,
          schools: totalSchools,
          users: 50,
          completionRate: 78,
          pendingApprovals: 15,
          notifications: mockNotifications,
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
          },
          pendingForms: pendingFormItems
        };
        setDashboardData(superAdminData);
      } else if (userRole === 'regionadmin') {
        const regionAdminData: RegionAdminDashboardData = {
          ...dashboardData,
          regionName: "Bakı",
          sectors: 5,
          schools: 15,
          users: 30,
          completionRate: 65,
          pendingApprovals: 10,
          pendingSchools: 6,
          approvedSchools: 20,
          rejectedSchools: 3,
          notifications: mockNotifications,
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
          ],
          pendingForms: pendingFormItems
        };
        setDashboardData(regionAdminData);
      } else if (userRole === 'sectoradmin') {
        const sectorAdminData: SectorAdminDashboardData = {
          ...dashboardData,
          sectorName: "Nəsimi",
          regionName: "Bakı",
          schools: 8,
          completionRate: 72,
          pendingApprovals: 5,
          pendingSchools: 3,
          approvedSchools: 12,
          rejectedSchools: 2,
          notifications: mockNotifications,
          pendingForms: pendingFormItems
        };
        setDashboardData(sectorAdminData);
      } else if (userRole === 'schooladmin') {
        const recentFormItems = getMockForms(2);
        
        const schoolAdminData: SchoolAdminDashboardData = {
          ...dashboardData,
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
          notifications: mockNotifications,
          categories: 5,
          totalForms: 15,
          completedForms: 10,
          rejectedForms: 2,
          pendingForms: pendingFormItems,
          dueDates: [
            { category: "Tədris planı", date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
            { category: "Maliyyə hesabatı", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
          ],
          recentForms: recentFormItems
        };
        setDashboardData(schoolAdminData as any);
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [t, user, categories, dataEntries, dashboardData, userRole]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { dashboardData, loading: isLoading, error, isLoading, chartData, userRole };
};

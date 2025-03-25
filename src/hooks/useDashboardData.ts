
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useCategories } from './useCategories';
import { useDataEntries } from './useDataEntries';
import { School } from '@/types/school';

export type FormStatus = 'pending' | 'approved' | 'rejected' | 'draft' | 'dueSoon' | 'overdue';

export interface DashboardData {
  totalSchools: number;
  activeSchools: number;
  pendingForms: {
    id: string;
    title: string;
    category: string;
    status: FormStatus;
    completionPercentage: number;
    deadline?: string;
  }[];
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
  totalRegions: number;
  totalSectors: number;
}

export interface RegionAdminDashboardData extends DashboardData {
  regionName: string;
  totalSectors: number;
}

export interface SectorAdminDashboardData extends DashboardData {
  sectorName: string;
  regionName: string;
}

export interface SchoolAdminDashboardData extends DashboardData {
  schoolName: string;
  sectorName: string;
  regionName: string;
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
  
  // Məktəblərin mock məlumatlarını yaradırıq
  const mockSchools: School[] = [
    { id: "1", name: "Şəhər Məktəbi #1", regionId: "1", sectorId: "1", status: "active" },
    { id: "2", name: "Şəhər Məktəbi #2", regionId: "1", sectorId: "1", status: "active" },
    { id: "3", name: "Kənd Məktəbi #1", regionId: "2", sectorId: "2", status: "active" },
    { id: "4", name: "Kənd Məktəbi #2", regionId: "2", sectorId: "2", status: "inactive" }
  ];
  
  // Mock region məlumatları
  const mockRegions = [
    { id: "1", name: "Bakı" },
    { id: "2", name: "Abşeron" },
    { id: "3", name: "Sumqayıt" }
  ];
  
  // Mock sektor məlumatları
  const mockSectors = [
    { id: "1", name: "Nəsimi", region_id: "1" },
    { id: "2", name: "Xırdalan", region_id: "2" },
    { id: "3", name: "28 May", region_id: "3" }
  ];

  const transformDeadlineToString = (deadline: string | Date | undefined): string => {
    if (!deadline) return '';
    return typeof deadline === 'string' ? deadline : deadline.toISOString();
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // İstifadəçi rolunu təyin et
      if (user) {
        setUserRole(user.role);
      }
      
      // Məktəblərin sayı
      const totalSchools = mockSchools.length;

      // Aktiv məktəblərin sayı
      const activeSchools = mockSchools.filter(school => school.status === 'active').length;

      // Gözləmədə olan formalar
      let pendingForms = categories.map(category => {
        return {
          id: category.id,
          title: category.name,
          category: category.name,
          status: 'pending' as FormStatus,
          completionPercentage: Math.floor(Math.random() * 100),
          deadline: transformDeadlineToString(category.deadline)
        };
      });

      // Yaxınlaşan son tarixlər
      let upcomingDeadlines = categories
        .filter(category => category.deadline)
        .slice(0, 5)
        .map(category => ({
          category: category.name,
          date: transformDeadlineToString(category.deadline)
        }));

      // Regional statistikalar
      let regionalStats = mockRegions.map(region => {
        return {
          region: region.name,
          approved: Math.floor(Math.random() * 50),
          pending: Math.floor(Math.random() * 30),
          rejected: Math.floor(Math.random() * 10)
        };
      });

      // Sektor statistikaları
      let sectorStats = mockSectors.map(sector => {
        return {
          sector: sector.name,
          approved: Math.floor(Math.random() * 30),
          pending: Math.floor(Math.random() * 20),
          rejected: Math.floor(Math.random() * 5)
        };
      });

      // Chart məlumatları
      const activityData = [
        { name: t('approved'), value: 65 },
        { name: t('pending'), value: 25 },
        { name: t('rejected'), value: 10 }
      ];

      const regionSchoolsData = mockRegions.map(region => {
        return {
          name: region.name,
          value: mockSchools.filter(school => school.regionId === region.id).length
        };
      });

      const categoryCompletionData = categories.slice(0, 5).map(category => {
        return {
          name: category.name,
          completed: Math.floor(Math.random() * 100)
        };
      });

      setChartData({
        activityData,
        regionSchoolsData,
        categoryCompletionData
      });

      setDashboardData({
        totalSchools,
        activeSchools,
        pendingForms,
        upcomingDeadlines,
        regionalStats,
        sectorStats
      });
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [t, user, categories, dataEntries]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { dashboardData, loading: isLoading, error, isLoading, chartData, userRole };
};

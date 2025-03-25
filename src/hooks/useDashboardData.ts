
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useCategories } from './useCategories';
import { useDataEntries } from './useDataEntries';
import { School } from '@/types/school';
import { useSchools } from './useSchools';
import { Notification } from '@/types/notification';

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
  pendingForms?: number;
  rejectedForms?: number;
  dueDates?: Array<{
    category: string;
    date: string;
  }>;
  recentForms?: Array<{
    id: string;
    title: string;
    category: string;
    status: FormStatus;
    completionPercentage: number;
    deadline?: string;
  }>;
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

  // Mock bildirişlər
  const mockNotifications: Notification[] = [
    {
      id: "1",
      title: "Yeni kateqoriya yaradıldı",
      message: "Tədris məlumatları kateqoriyası yaradıldı",
      time: new Date().toISOString(),
      read: false,
      type: "info"
    },
    {
      id: "2",
      title: "Məlumat tələb olunur",
      message: "Maliyyə məlumatlarını doldurmağınız xahiş olunur",
      time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      type: "warning"
    }
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

      // Əsas dashboardData məlumatlarını ayarlayırıq
      setDashboardData({
        totalSchools,
        activeSchools,
        pendingForms,
        upcomingDeadlines,
        regionalStats,
        sectorStats
      });

      // Rol tipinə görə əlavə məlumatlar yaradırıq
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
          }
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
          ]
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
          notifications: mockNotifications
        };
        setDashboardData(sectorAdminData);
      } else if (userRole === 'schooladmin') {
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
          pendingForms: 3,
          rejectedForms: 2,
          dueDates: [
            { category: "Tədris planı", date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
            { category: "Maliyyə hesabatı", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
          ],
          recentForms: [
            {
              id: "form-1",
              title: "Tədris planı",
              category: "Tədris",
              status: 'pending',
              completionPercentage: 75
            },
            {
              id: "form-2",
              title: "Müəllim məlumatları",
              category: "Kadr",
              status: 'approved',
              completionPercentage: 100
            }
          ]
        };
        setDashboardData(schoolAdminData);
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

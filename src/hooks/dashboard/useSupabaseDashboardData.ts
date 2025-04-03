import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChartData } from '@/types/dashboard';
import { useAuth } from '@/context/AuthContext';

interface DashboardData {
  totalSchools?: number;
  activeSchools?: number;
  pendingForms?: any[];
  upcomingDeadlines?: any[];
  notifications?: any[];
  totalUsers?: number;
  activeUsers?: number;
  totalCategories?: number;
  totalColumns?: number;
  totalForms?: number;
  regionStatistics?: any[];
  sectorStatistics?: any[];
  schoolsInSector?: any[];
}

export const useSupabaseDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!user || !user.role) {
          throw new Error('İstifadəçi rolu əldə edilə bilmədi.');
        }

        setUserRole(user.role);

        let data: DashboardData = {};

        switch (user.role) {
          case 'superadmin':
            data = await fetchSuperAdminDashboardData();
            break;
          case 'regionadmin':
            if (!user.regionId) {
              throw new Error('Region administratoru üçün region ID-si tapılmadı.');
            }
            data = await fetchRegionAdminDashboardData(user.regionId);
            break;
          case 'sectoradmin':
            if (!user.sectorId) {
              throw new Error('Sektor administratoru üçün sektor ID-si tapılmadı.');
            }
            data = await fetchSectorAdminDashboardData(user.sectorId);
            break;
          case 'schooladmin':
            if (!user.schoolId) {
              throw new Error('Məktəb administratoru üçün məktəb ID-si tapılmadı.');
            }
            data = await fetchSchoolAdminDashboardData(user.schoolId);
            break;
          default:
            throw new Error(`Bilinməyən istifadəçi rolu: ${user.role}`);
        }

        setDashboardData(data);
        setChartData(await fetchChartData());
      } catch (err: any) {
        setError(err);
        console.error('Dashboard məlumatlarını əldə edərkən xəta:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const refreshData = async () => {
    if (user) {
      setIsLoading(true);
      setError(null);
      try {
        let data: DashboardData = {};

        switch (user.role) {
          case 'superadmin':
            data = await fetchSuperAdminDashboardData();
            break;
          case 'regionadmin':
            if (!user.regionId) {
              throw new Error('Region administratoru üçün region ID-si tapılmadı.');
            }
            data = await fetchRegionAdminDashboardData(user.regionId);
            break;
          case 'sectoradmin':
            if (!user.sectorId) {
              throw new Error('Sektor administratoru üçün sektor ID-si tapılmadı.');
            }
            data = await fetchSectorAdminDashboardData(user.sectorId);
            break;
          case 'schooladmin':
            if (!user.schoolId) {
              throw new Error('Məktəb administratoru üçün məktəb ID-si tapılmadı.');
            }
            data = await fetchSchoolAdminDashboardData(user.schoolId);
            break;
          default:
            throw new Error(`Bilinməyən istifadəçi rolu: ${user.role}`);
        }

        setDashboardData(data);
        setChartData(await fetchChartData());
      } catch (err: any) {
        setError(err);
        console.error('Dashboard məlumatlarını yenilərkən xəta:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Bu funksiya notification tipini düzgün formatda çevirmək üçün istifadə olunacaq
  const mapNotificationData = (notifications: any[]) => {
    return notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      time: notification.created_at, // time sahəsini created_at ilə əvəz edirik
    }));
  };

  // Supabase-dən SuperAdmin üçün məlumatları əldə etmə funksiyası
  const fetchSuperAdminDashboardData = async (): Promise<DashboardData> => {
    try {
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('id');

      const { data: activeSchoolsData, error: activeSchoolsError } = await supabase
        .from('schools')
        .select('id')
        .eq('status', 'active');

      const { data: pendingFormsData, error: pendingFormsError } = await supabase
        .from('data_entries')
        .select('*')
        .eq('status', 'pending')
        .limit(5);

      const { data: upcomingDeadlinesData, error: upcomingDeadlinesError } = await supabase
        .from('data_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .limit(5);

      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id');

      const { data: activeUsersData, error: activeUsersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('status', 'active');

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id');

      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('id');

      const { data: formsData, error: formsError } = await supabase
        .from('data_entries')
        .select('id');

      if (
        schoolsError || activeSchoolsError || pendingFormsError || upcomingDeadlinesError ||
        notificationsError || usersError || activeUsersError || categoriesError ||
        columnsError || formsError
      ) {
        throw new Error('Məlumatları əldə edərkən xəta baş verdi.');
      }

      const dashboardData: DashboardData = {
        totalSchools: schoolsData ? schoolsData.length : 0,
        activeSchools: activeSchoolsData ? activeSchoolsData.length : 0,
        pendingForms: pendingFormsData || [],
        upcomingDeadlines: upcomingDeadlinesData || [],
        totalUsers: usersData ? usersData.length : 0,
        activeUsers: activeUsersData ? activeUsersData.length : 0,
        totalCategories: categoriesData ? categoriesData.length : 0,
        totalColumns: columnsData ? columnsData.length : 0,
        totalForms: formsData ? formsData.length : 0,
      };

      // notifications üçün düzəliş
      if (notificationsData && !notificationsError) {
        dashboardData.notifications = mapNotificationData(notificationsData);
      }

      return dashboardData;
    } catch (error) {
      console.error('SuperAdmin dashboard məlumatlarını əldə edərkən xəta:', error);
      setError(error as Error);
      return {};
    }
  };

  // Region Admin üçün məlumatları əldə etmə funksiyası
  const fetchRegionAdminDashboardData = async (regionId: string): Promise<DashboardData> => {
    try {
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('id')
        .eq('region_id', regionId);

      const { data: activeSchoolsData, error: activeSchoolsError } = await supabase
        .from('schools')
        .select('id')
        .eq('region_id', regionId)
        .eq('status', 'active');

      const { data: pendingFormsData, error: pendingFormsError } = await supabase
        .from('data_entries')
        .select('*')
        .eq('status', 'pending')
        .in('school_id', schoolsData ? schoolsData.map(school => school.id) : []);

      const { data: upcomingDeadlinesData, error: upcomingDeadlinesError } = await supabase
        .from('data_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .in('school_id', schoolsData ? schoolsData.map(school => school.id) : [])
        .limit(5);

      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .limit(5);

      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('region_id', regionId);

      const { data: activeUsersData, error: activeUsersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('region_id', regionId)
        .eq('status', 'active');

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id');

      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('id');

      const { data: formsData, error: formsError } = await supabase
        .from('data_entries')
        .select('id')
        .in('school_id', schoolsData ? schoolsData.map(school => school.id) : []);

      if (
        schoolsError || activeSchoolsError || pendingFormsError || upcomingDeadlinesError ||
        notificationsError || usersError || activeUsersError || categoriesError ||
        columnsError || formsError
      ) {
        throw new Error('Məlumatları əldə edərkən xəta baş verdi.');
      }

      const dashboardData: DashboardData = {
        totalSchools: schoolsData ? schoolsData.length : 0,
        activeSchools: activeSchoolsData ? activeSchoolsData.length : 0,
        pendingForms: pendingFormsData || [],
        upcomingDeadlines: upcomingDeadlinesData || [],
        totalUsers: usersData ? usersData.length : 0,
        activeUsers: activeUsersData ? activeUsersData.length : 0,
        totalCategories: categoriesData ? categoriesData.length : 0,
        totalColumns: columnsData ? columnsData.length : 0,
        totalForms: formsData ? formsData.length : 0,
      };

      // notifications üçün düzəliş
      if (notificationsData && !notificationsError) {
        dashboardData.notifications = mapNotificationData(notificationsData);
      }

      return dashboardData;
    } catch (error) {
      console.error('RegionAdmin dashboard məlumatlarını əldə edərkən xəta:', error);
      setError(error as Error);
      return {};
    }
  };

  // Sector Admin üçün məlumatları əldə etmə funksiyası
  const fetchSectorAdminDashboardData = async (sectorId: string): Promise<DashboardData> => {
    try {
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('id')
        .eq('sector_id', sectorId);

      const { data: activeSchoolsData, error: activeSchoolsError } = await supabase
        .from('schools')
        .select('id')
        .eq('sector_id', sectorId)
        .eq('status', 'active');

      const { data: pendingFormsData, error: pendingFormsError } = await supabase
        .from('data_entries')
        .select('*')
        .eq('status', 'pending')
        .in('school_id', schoolsData ? schoolsData.map(school => school.id) : []);

      const { data: upcomingDeadlinesData, error: upcomingDeadlinesError } = await supabase
        .from('data_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .in('school_id', schoolsData ? schoolsData.map(school => school.id) : [])
        .limit(5);

      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .limit(5);

      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id')
        .in('school_id', schoolsData ? schoolsData.map(school => school.id) : []);

      const { data: activeUsersData, error: activeUsersError } = await supabase
        .from('profiles')
        .select('id')
        .in('school_id', schoolsData ? schoolsData.map(school => school.id) : [])
        .eq('status', 'active');

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id');

      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('id');

      const { data: formsData, error: formsError } = await supabase
        .from('data_entries')
        .select('id')
        .in('school_id', schoolsData ? schoolsData.map(school => school.id) : []);

      if (
        schoolsError || activeSchoolsError || pendingFormsError || upcomingDeadlinesError ||
        notificationsError || usersError || activeUsersError || categoriesError ||
        columnsError || formsError
      ) {
        throw new Error('Məlumatları əldə edərkən xəta baş verdi.');
      }

      const dashboardData: DashboardData = {
        totalSchools: schoolsData ? schoolsData.length : 0,
        activeSchools: activeSchoolsData ? activeSchoolsData.length : 0,
        pendingForms: pendingFormsData || [],
        upcomingDeadlines: upcomingDeadlinesData || [],
        totalUsers: usersData ? usersData.length : 0,
        activeUsers: activeUsersData ? activeUsersData.length : 0,
        totalCategories: categoriesData ? categoriesData.length : 0,
        totalColumns: columnsData ? columnsData.length : 0,
        totalForms: formsData ? formsData.length : 0,
      };

      // notifications üçün düzəliş
      if (notificationsData && !notificationsError) {
        dashboardData.notifications = mapNotificationData(notificationsData);
      }

      return dashboardData;
    } catch (error) {
      console.error('SectorAdmin dashboard məlumatlarını əldə edərkən xəta:', error);
      setError(error as Error);
      return {};
    }
  };

  // School Admin üçün məlumatları əldə etmə funksiyası
  const fetchSchoolAdminDashboardData = async (schoolId: string): Promise<DashboardData> => {
    try {
      const { data: pendingFormsData, error: pendingFormsError } = await supabase
        .from('data_entries')
        .select('*')
        .eq('school_id', schoolId)
        .eq('status', 'pending')
        .limit(5);

      const { data: upcomingDeadlinesData, error: upcomingDeadlinesError } = await supabase
        .from('data_entries')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .limit(5);

      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('school_id', schoolId);

      const { data: activeUsersData, error: activeUsersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('school_id', schoolId)
        .eq('status', 'active');

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id');

      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('id');

      const { data: formsData, error: formsError } = await supabase
        .from('data_entries')
        .select('id')
        .eq('school_id', schoolId);

      if (
        pendingFormsError || upcomingDeadlinesError || notificationsError ||
        usersError || activeUsersError || categoriesError || columnsError || formsError
      ) {
        throw new Error('Məlumatları əldə edərkən xəta baş verdi.');
      }

      const dashboardData: DashboardData = {
        pendingForms: pendingFormsData || [],
        upcomingDeadlines: upcomingDeadlinesData || [],
        totalUsers: usersData ? usersData.length : 0,
        activeUsers: activeUsersData ? activeUsersData.length : 0,
        totalCategories: categoriesData ? categoriesData.length : 0,
        totalColumns: columnsData ? columnsData.length : 0,
        totalForms: formsData ? formsData.length : 0,
      };

      // notifications üçün düzəliş
      if (notificationsData && !notificationsError) {
        dashboardData.notifications = mapNotificationData(notificationsData);
      }

      return dashboardData;
    } catch (error) {
      console.error('SchoolAdmin dashboard məlumatlarını əldə edərkən xəta:', error);
      setError(error as Error);
      return {};
    }
  };

  const fetchChartData = async (): Promise<ChartData> => {
    // Mock chart data (əsl məlumatlar Supabase-dən gələcək)
    const activityData = [
      { name: 'Yan', value: 20 },
      { name: 'Fev', value: 45 },
      { name: 'Mar', value: 28 },
      { name: 'Apr', value: 60 },
      { name: 'May', value: 35 },
      { name: 'İyun', value: 80 },
    ];

    const regionSchoolsData = [
      { name: 'Bakı', value: 120 },
      { name: 'Sumqayıt', value: 75 },
      { name: 'Gəncə', value: 90 },
    ];

    const categoryCompletionData = [
      { name: 'Ümumi məlumat', completed: 78 },
      { name: 'Müəllim heyəti', completed: 65 },
      { name: 'Şagird məlumatları', completed: 85 },
    ];

    return {
      activityData,
      regionSchoolsData,
      categoryCompletionData,
    };
  };

  return {
    dashboardData,
    isLoading,
    error,
    chartData,
    userRole,
    refreshData,
  };
};

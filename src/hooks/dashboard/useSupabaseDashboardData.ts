import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getMockCategoryCompletion } from '@/utils/dashboardUtils';

// Dashboard data fetch hook
export function useSupabaseDashboardData(userRole: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [chartData, setChartData] = useState<any>({
    categoryCompletion: [],
    statusDistribution: [],
    activityData: [],
    regionSchoolsData: [],
    categoryCompletionData: []
  });

  const fetchSuperAdminData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Regionlar sayı
      const { count: regionsCount, error: regionsError } = await supabase
        .from('regions')
        .select('*', { count: 'exact', head: true });

      // Sektorlar sayı
      const { count: sectorsCount, error: sectorsError } = await supabase
        .from('sectors')
        .select('*', { count: 'exact', head: true });

      // Məktəblər sayı
      const { count: schoolsCount, error: schoolsError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true });

      // İstifadəçilər sayı
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Son aktivliklər
      const { data: activities, error: activitiesError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Bildirişlər
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', 'all')
        .order('created_at', { ascending: false })
        .limit(5);

      // Kateqoriyalar tamamlanma dərəcəsi
      const categoryCompletionData = getMockCategoryCompletion();
      
      if (regionsError || sectorsError || schoolsError || usersError || activitiesError || notificationsError) {
        throw new Error("Data fetch error");
      }

      // Status paylanması - mocklanmış məlumatlar
      const statusDistribution = [
        { status: 'pending', count: 12 },
        { status: 'approved', count: 45 },
        { status: 'rejected', count: 8 },
        { status: 'overdue', count: 3 }
      ];

      // Dashboard data obyektini yaradaq
      const dashboard = {
        regions: regionsCount || 0,
        sectors: sectorsCount || 0, 
        schools: schoolsCount || 0,
        users: usersCount || 0,
        completionRate: 72, // örnek bir değer
        pendingApprovals: 15, // örnek bir değer
        notifications: notifications || [],
        activityData: activities || [],
        categoryCompletion: categoryCompletionData,
        statusDistribution: statusDistribution,
        pendingSchools: 18,
        approvedSchools: 130,
        rejectedSchools: 5,
        dueSoonForms: 10,
        overdueForms: 3
      };

      // Chart məlumatlarını ayıraq
      const charts = {
        activityData: activities || [],
        regionSchoolsData: [
          { name: 'Bakı', value: 85 },
          { name: 'Sumqayıt', value: 25 },
          { name: 'Gəncə', value: 30 },
          { name: 'Lənkəran', value: 15 },
          { name: 'Şəki', value: 10 }
        ],
        categoryCompletionData: categoryCompletionData,
        categoryCompletion: categoryCompletionData,
        statusDistribution: statusDistribution
      };

      setDashboardData(dashboard);
      setChartData(charts);
      setIsLoading(false);

    } catch (err) {
      console.error("Dashboard data fetching error:", err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setIsLoading(false);
    }
  }, []);

  const fetchRegionAdminData = useCallback(async (regionId?: string) => {
    try {
      setIsLoading(true);
      
      // Region məlumatlarını əldə et
      const { data: regionData, error: regionError } = await supabase
        .from('regions')
        .select('*')
        .eq('id', regionId || '1')
        .single();

      // Bu region üçün sektorlar sayı
      const { count: sectorsCount, error: sectorsError } = await supabase
        .from('sectors')
        .select('*', { count: 'exact', head: true })
        .eq('region_id', regionId || '1');

      // Bu region üçün məktəblər sayı
      const { count: schoolsCount, error: schoolsError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('region_id', regionId || '1');

      // Son aktivliklər
      const { data: activities, error: activitiesError } = await supabase
        .from('notifications')
        .select('*')
        .eq('region_id', regionId || '1')
        .order('created_at', { ascending: false })
        .limit(10);

      // Bildirişlər
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.all,region_id.eq.${regionId || '1'}`)
        .order('created_at', { ascending: false })
        .limit(5);

      // Kateqoriyalar tamamlanma dərəcəsi
      const categoryCompletionData = getMockCategoryCompletion();
      
      if (regionError || sectorsError || schoolsError || activitiesError || notificationsError) {
        throw new Error("Data fetch error");
      }

      // Status paylanması - mocklanmış məlumatlar
      const statusDistribution = [
        { status: 'pending', count: 8 },
        { status: 'approved', count: 32 },
        { status: 'rejected', count: 5 },
        { status: 'overdue', count: 2 }
      ];

      // Dashboard data obyektini yaradaq
      const dashboard = {
        regionName: regionData?.name || 'Unknown Region',
        sectors: sectorsCount || 0, 
        schools: schoolsCount || 0,
        completionRate: 68, // örnek bir değer
        approvalRate: 75, // örnek bir değer
        pendingApprovals: 10, // örnek bir değer
        notifications: notifications || [],
        activityData: activities || [],
        categoryCompletion: categoryCompletionData,
        statusDistribution: statusDistribution,
        pendingSchools: 12,
        approvedSchools: 85,
        rejectedSchools: 3,
        approvedSectors: 5,
        rejectedSectors: 1,
        users: 45 // Əlavə edildi
      };

      // Chart məlumatlarını ayıraq
      const charts = {
        activityData: activities || [],
        regionSchoolsData: [
          { name: 'Sektor A', value: 35 },
          { name: 'Sektor B', value: 22 },
          { name: 'Sektor C', value: 28 },
        ],
        categoryCompletionData: categoryCompletionData,
        categoryCompletion: categoryCompletionData,
        statusDistribution: statusDistribution
      };

      setDashboardData(dashboard);
      setChartData(charts);
      setIsLoading(false);

    } catch (err) {
      console.error("Dashboard data fetching error:", err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setIsLoading(false);
    }
  }, []);

  const fetchSectorAdminData = useCallback(async (sectorId?: string) => {
    try {
      setIsLoading(true);
      
      // Sektor məlumatlarını əldə et
      const { data: sectorData, error: sectorError } = await supabase
        .from('sectors')
        .select('*, regions(*)')
        .eq('id', sectorId || '1')
        .single();

      // Bu sektor üçün məktəblər sayı
      const { count: schoolsCount, error: schoolsError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('sector_id', sectorId || '1');

      // Son aktivliklər
      const { data: activities, error: activitiesError } = await supabase
        .from('notifications')
        .select('*')
        .eq('sector_id', sectorId || '1')
        .order('created_at', { ascending: false })
        .limit(10);

      // Bildirişlər
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.all,sector_id.eq.${sectorId || '1'}`)
        .order('created_at', { ascending: false })
        .limit(5);

      // Kateqoriyalar tamamlanma dərəcəsi
      const categoryCompletionData = getMockCategoryCompletion();
      
      if (sectorError || schoolsError || activitiesError || notificationsError) {
        throw new Error("Data fetch error");
      }

      // Status paylanması - mocklanmış məlumatlar
      const statusDistribution = [
        { status: 'pending', count: 5 },
        { status: 'approved', count: 20 },
        { status: 'rejected', count: 3 },
        { status: 'overdue', count: 1 }
      ];

      // Dashboard data obyektini yaradaq
      const dashboard = {
        sectorName: sectorData?.name || 'Unknown Sector',
        regionName: sectorData?.regions?.name || 'Unknown Region',
        schools: schoolsCount || 0,
        completionRate: 65, // örnek bir değer
        pendingApprovals: 7, // örnek bir değer
        notifications: notifications || [],
        activityData: activities || [],
        categoryCompletion: categoryCompletionData,
        statusDistribution: statusDistribution,
        pendingSchools: 8,
        approvedSchools: 52,
        rejectedSchools: 2,
        users: 30 // Əlavə edildi
      };

      // Chart məlumatlarını ayıraq
      const charts = {
        activityData: activities || [],
        regionSchoolsData: [
          { name: 'Məktəb A', value: 20 },
          { name: 'Məktəb B', value: 15 },
          { name: 'Məktəb C', value: 17 },
        ],
        categoryCompletionData: categoryCompletionData,
        categoryCompletion: categoryCompletionData,
        statusDistribution: statusDistribution
      };

      setDashboardData(dashboard);
      setChartData(charts);
      setIsLoading(false);

    } catch (err) {
      console.error("Dashboard data fetching error:", err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setIsLoading(false);
    }
  }, []);

  const fetchSchoolAdminData = useCallback(async (schoolId?: string) => {
    try {
      setIsLoading(true);
      
      // Məktəb məlumatlarını əldə et
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('*, sectors(*, regions(*))')
        .eq('id', schoolId || '1')
        .single();

      // Son aktivliklər
      const { data: activities, error: activitiesError } = await supabase
        .from('notifications')
        .select('*')
        .eq('school_id', schoolId || '1')
        .order('created_at', { ascending: false })
        .limit(10);

      // Bildirişlər
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.all,school_id.eq.${schoolId || '1'}`)
        .order('created_at', { ascending: false })
        .limit(5);

      // Kateqoriyalar tamamlanma dərəcəsi
      const categoryCompletionData = getMockCategoryCompletion();
      
      if (schoolError || activitiesError || notificationsError) {
        throw new Error("Data fetch error");
      }

      // Status paylanması - mocklanmış məlumatlar
      const statusDistribution = [
        { status: 'pending', count: 3 },
        { status: 'approved', count: 12 },
        { status: 'rejected', count: 2 },
        { status: 'overdue', count: 1 },
        { status: 'dueSoon', count: 4 }
      ];

      // Dashboard data obyektini yaradaq
      const dashboard = {
        schoolName: schoolData?.name || 'Unknown School',
        sectorName: schoolData?.sectors?.name || 'Unknown Sector',
        regionName: schoolData?.sectors?.regions?.name || 'Unknown Region',
        completionRate: 62, // örnek bir değer
        forms: {
          pending: 3,
          approved: 12,
          rejected: 2,
          dueSoon: 4,
          overdue: 1
        },
        notifications: notifications || [],
        activityData: activities || [],
        categoryCompletion: categoryCompletionData,
        statusDistribution: statusDistribution,
        pendingForms: [],
        completedForms: [],
        dueSoonForms: [],
        overdueForms: [],
        totalForms: 22 // Əlavə edildi
      };

      // Chart məlumatlarını ayıraq
      const charts = {
        activityData: activities || [],
        regionSchoolsData: [
          { name: 'Kateqoriya A', value: 10 },
          { name: 'Kateqoriya B', value: 8 },
          { name: 'Kateqoriya C', value: 4 },
        ],
        categoryCompletionData: categoryCompletionData,
        categoryCompletion: categoryCompletionData,
        statusDistribution: statusDistribution
      };

      setDashboardData(dashboard);
      setChartData(charts);
      setIsLoading(false);

    } catch (err) {
      console.error("Dashboard data fetching error:", err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setIsLoading(false);
    }
  }, []);

  // İstifadəçi rolundan asılı olaraq uyğun məlumatları əldə et
  useEffect(() => {
    const fetchData = async () => {
      if (!userRole) return;

      switch (userRole) {
        case 'superadmin':
          await fetchSuperAdminData();
          break;
        case 'regionadmin':
          await fetchRegionAdminData();
          break;
        case 'sectoradmin':
          await fetchSectorAdminData();
          break;
        case 'schooladmin':
          await fetchSchoolAdminData();
          break;
        default:
          setError(new Error('Unknown user role'));
          setIsLoading(false);
      }
    };

    fetchData();
  }, [userRole, fetchSuperAdminData, fetchRegionAdminData, fetchSectorAdminData, fetchSchoolAdminData]);

  // Məlumatları yeniləmək üçün funksiya
  const refreshData = useCallback(() => {
    if (!userRole) return;

    switch (userRole) {
      case 'superadmin':
        fetchSuperAdminData();
        break;
      case 'regionadmin':
        fetchRegionAdminData();
        break;
      case 'sectoradmin':
        fetchSectorAdminData();
        break;
      case 'schooladmin':
        fetchSchoolAdminData();
        break;
    }
  }, [userRole, fetchSuperAdminData, fetchRegionAdminData, fetchSectorAdminData, fetchSchoolAdminData]);

  return {
    dashboardData,
    isLoading,
    error,
    chartData: chartData || {
      categoryCompletion: [],
      statusDistribution: [],
      activityData: [],
      regionSchoolsData: [],
      categoryCompletionData: []
    },
    refreshData,
    fetchSuperAdminData,
    fetchRegionAdminData,
    fetchSectorAdminData,
    fetchSchoolAdminData
  };
}

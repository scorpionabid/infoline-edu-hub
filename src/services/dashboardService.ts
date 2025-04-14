import { supabase } from '@/integrations/supabase/client';
import { DashboardData, ChartData, StatsItem } from '@/types/dashboard';
import { formatDistance } from 'date-fns';
import { UserRole } from '@/types/user';

// Əsas dashboard məlumatlarını yükləmək üçün funksiyalar

/**
 * SuperAdmin üçün dashboard məlumatlarını əldə edir
 */
export const fetchSuperAdminDashboard = async (): Promise<DashboardData> => {
  try {
    console.log('SuperAdmin dashboard məlumatları əldə edilir...');
    
    // Statistika məlumatlarını əldə et
    const [
      regionsCount,
      sectorsCount, 
      schoolsCount, 
      usersCount,
      completionRateAvg,
      pendingApprovalsCount
    ] = await Promise.all([
      fetchRegionsCount(),
      fetchSectorsCount(),
      fetchSchoolsCount(),
      fetchUsersCount(),
      fetchOverallCompletionRate(),
      fetchPendingApprovalsCount()
    ]);
    
    // Son bildirişləri əldə et
    const notifications = await fetchRecentNotifications(10);
    
    // Region statistikalarını əldə et
    const regionStats = await fetchRegionStats();
    
    // Form statuslarının sayını əldə et
    const formsByStatus = await fetchFormStatusCounts();
    
    // Statistika elementlərini hazırla
    const stats: StatsItem[] = [
      {
        id: '1',
        title: 'Ümumi məktəblər',
        value: schoolsCount,
        change: 5,
        changeType: 'increase'
      },
      {
        id: '2',
        title: 'Tamamlanma nisbəti',
        value: completionRateAvg,
        change: 12,
        changeType: 'increase'
      },
      {
        id: '3',
        title: 'Təsdiq gözləyən',
        value: pendingApprovalsCount,
        change: 0,
        changeType: 'neutral'
      },
      {
        id: '4',
        title: 'İstifadəçilər',
        value: usersCount,
        change: 2,
        changeType: 'increase'
      }
    ];
    
    // Dashboard məlumatlarını hazırla
    const dashboardData: any = {
      regions: regionsCount,
      sectors: sectorsCount,
      schools: schoolsCount,
      users: usersCount,
      completionRate: completionRateAvg,
      pendingApprovals: pendingApprovalsCount,
      notifications,
      stats,
      formsByStatus,
      regionStats
    };
    
    return dashboardData;
  } catch (error) {
    console.error('SuperAdmin dashboard məlumatlarını əldə edərkən xəta:', error);
    throw error;
  }
};

/**
 * RegionAdmin üçün dashboard məlumatlarını əldə edir
 */
export const fetchRegionAdminDashboard = async (regionId: string): Promise<DashboardData> => {
  try {
    console.log('RegionAdmin dashboard məlumatları əldə edilir, region ID:', regionId);
    
    // Region üçün məlumatları əldə et
    const [
      sectorsCount, 
      schoolsCount, 
      usersCount,
      completionRateAvg,
      pendingApprovalsCount,
      pendingSchoolsCount,
      approvedSchoolsCount,
      rejectedSchoolsCount
    ] = await Promise.all([
      fetchSectorsCountByRegion(regionId),
      fetchSchoolsCountByRegion(regionId),
      fetchUsersCountByRegion(regionId),
      fetchCompletionRateByRegion(regionId),
      fetchPendingApprovalsByRegion(regionId),
      fetchSchoolsCountByStatusForRegion(regionId, 'pending'),
      fetchSchoolsCountByStatusForRegion(regionId, 'approved'),
      fetchSchoolsCountByStatusForRegion(regionId, 'rejected')
    ]);
    
    // Son bildirişləri əldə et
    const notifications = await fetchRecentNotificationsByRegion(regionId, 10);
    
    // Kateqoriya tamamlanma məlumatlarını əldə et
    const categories = await fetchCategoryCompletionsByRegion(regionId);
    
    // Sektor tamamlanma məlumatlarını əldə et
    const sectorCompletions = await fetchSectorCompletionsByRegion(regionId);
    
    // Statistika elementlərini hazırla
    const stats: StatsItem[] = [
      {
        id: '1',
        title: 'Ümumi məktəblər',
        value: schoolsCount,
        change: 0,
        changeType: 'neutral'
      },
      {
        id: '2',
        title: 'Tamamlanma nisbəti',
        value: completionRateAvg,
        change: 8,
        changeType: 'increase'
      },
      {
        id: '3',
        title: 'Təsdiq gözləyən',
        value: pendingApprovalsCount,
        change: 0,
        changeType: 'neutral'
      },
      {
        id: '4',
        title: 'İstifadəçilər',
        value: usersCount,
        change: 0,
        changeType: 'neutral'
      }
    ];
    
    // Dashboard məlumatlarını hazırla
    const dashboardData: any = {
      sectors: sectorsCount,
      schools: schoolsCount,
      users: usersCount,
      completionRate: completionRateAvg,
      pendingApprovals: pendingApprovalsCount,
      pendingSchools: pendingSchoolsCount,
      approvedSchools: approvedSchoolsCount,
      rejectedSchools: rejectedSchoolsCount,
      notifications,
      stats,
      categories,
      sectorCompletions
    };
    
    return dashboardData;
  } catch (error) {
    console.error('RegionAdmin dashboard məlumatlarını əldə edərkən xəta:', error);
    throw error;
  }
};

/**
 * SectorAdmin üçün dashboard məlumatlarını əldə edir
 */
export const fetchSectorAdminDashboard = async (sectorId: string): Promise<DashboardData> => {
  try {
    console.log('SectorAdmin dashboard məlumatları əldə edilir, sektor ID:', sectorId);
    
    // Sektor üçün məlumatları əldə et
    const [
      schoolsCount, 
      completionRateAvg,
      pendingApprovalsCount,
      pendingSchoolsCount,
      approvedSchoolsCount,
      rejectedSchoolsCount
    ] = await Promise.all([
      fetchSchoolsCountBySector(sectorId),
      fetchCompletionRateBySector(sectorId),
      fetchPendingApprovalsBySector(sectorId),
      fetchSchoolsCountByStatusForSector(sectorId, 'pending'),
      fetchSchoolsCountByStatusForSector(sectorId, 'approved'),
      fetchSchoolsCountByStatusForSector(sectorId, 'rejected')
    ]);
    
    // Son bildirişləri əldə et
    const notifications = await fetchRecentNotificationsBySector(sectorId, 10);
    
    // Məktəb statistikalarını əldə et
    const schoolStats = await fetchSchoolStatsBySector(sectorId);
    
    // Təsdiq gözləyən məlumatları əldə et
    const pendingItems = await fetchPendingItemsBySector(sectorId);
    
    // Kateqoriya tamamlanma məlumatlarını əldə et
    const categoryCompletion = await fetchCategoryCompletionsBySector(sectorId);
    
    // Aktivlik jurnalını əldə et
    const activityLog = await fetchActivityLogBySector(sectorId);
    
    // Statistika elementlərini hazırla
    const stats: StatsItem[] = [
      {
        id: '1',
        title: 'Ümumi məktəblər',
        value: schoolsCount,
        change: 0,
        changeType: 'neutral'
      },
      {
        id: '2',
        title: 'Tamamlanma nisbəti',
        value: completionRateAvg,
        change: 5,
        changeType: 'increase'
      },
      {
        id: '3',
        title: 'Təsdiq gözləyən',
        value: pendingApprovalsCount,
        change: 2,
        changeType: 'decrease'
      }
    ];
    
    // Dashboard məlumatlarını hazırla
    const dashboardData: any = {
      schools: schoolsCount,
      completionRate: completionRateAvg,
      pendingApprovals: pendingApprovalsCount,
      pendingSchools: pendingSchoolsCount,
      approvedSchools: approvedSchoolsCount,
      rejectedSchools: rejectedSchoolsCount,
      notifications,
      stats,
      schoolStats,
      pendingItems,
      categoryCompletion,
      activityLog
    };
    
    return dashboardData;
  } catch (error) {
    console.error('SectorAdmin dashboard məlumatlarını əldə edərkən xəta:', error);
    throw error;
  }
};

// Dashboard qrafik məlumatlarını əldə edir
export const fetchDashboardChartData = async (): Promise<ChartData> => {
  try {
    console.log('Dashboard qrafik məlumatları əldə edilir...');
    
    // Fəaliyyət məlumatlarını əldə et
    const activityData = await fetchActivityData();
    
    // Regionlardakı məktəb məlumatlarını əldə et
    const regionSchoolsData = await fetchRegionSchoolsData();
    
    // Kateqoriya tamamlanma məlumatlarını əldə et
    const categoryCompletionData = await fetchCategoryCompletionData();
    
    return {
      activityData,
      regionSchoolsData,
      categoryCompletionData
    };
  } catch (error) {
    console.error('Dashboard qrafik məlumatlarını əldə edərkən xəta:', error);
    throw error;
  }
};

// Helper funksiyalar
// Ümumi məktəblərin sayını əldə et
const fetchSchoolsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true });
      
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Məktəblərin sayını əldə edərkən xəta:', error);
    return 0;
  }
};

// Region üzrə məktəblərin sayını əldə et
const fetchSchoolsCountByRegion = async (regionId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })
      .eq('region_id', regionId);
      
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Region üzrə məktəblərin sayını əldə edərkən xəta:', error);
    return 0;
  }
};

// Sektor üzrə məktəblərin sayını əldə et
const fetchSchoolsCountBySector = async (sectorId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })
      .eq('sector_id', sectorId);
      
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Sektor üzrə məktəblərin sayını əldə edərkən xəta:', error);
    return 0;
  }
};

// Region və status üzrə məktəblərin sayını əldə et
const fetchSchoolsCountByStatusForRegion = async (regionId: string, status: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })
      .eq('region_id', regionId)
      .eq('status', status);
      
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Region və status üzrə məktəblərin sayını əldə edərkən xəta:', error);
    return 0;
  }
};

// Sektor və status üzrə məktəblərin sayını əldə et
const fetchSchoolsCountByStatusForSector = async (sectorId: string, status: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })
      .eq('sector_id', sectorId)
      .eq('status', status);
      
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Sektor və status üzrə məktəblərin sayını əldə edərkən xəta:', error);
    return 0;
  }
};

// Ümumi istifadəçilərin sayını əldə et
const fetchUsersCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
      
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('İstifadəçilərin sayını əldə edərkən xəta:', error);
    return 0;
  }
};

// Region üzrə istifadəçilərin sayını əldə et
const fetchUsersCountByRegion = async (regionId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*, schools(region_id)', { count: 'exact', head: true })
      .eq('schools.region_id', regionId);
      
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Region üzrə istifadəçilərin sayını əldə edərkən xəta:', error);
    return 0;
  }
};

// Ümumi tamamlanma faizini əldə et
const fetchOverallCompletionRate = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('completion_rate');
      
    if (error) throw error;
    
    const totalCompletionRate = data?.reduce((sum, school) => sum + (school.completion_rate || 0), 0) || 0;
    const averageCompletionRate = data?.length ? totalCompletionRate / data.length : 0;
    return Math.round(averageCompletionRate);
  } catch (error) {
    console.error('Ümumi tamamlanma faizini əldə edərkən xəta:', error);
    return 0;
  }
};

// Region üzrə tamamlanma faizini əldə et
const fetchCompletionRateByRegion = async (regionId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('completion_rate')
      .eq('region_id', regionId);
      
    if (error) throw error;
    
    const totalCompletionRate = data?.reduce((sum, school) => sum + (school.completion_rate || 0), 0) || 0;
    const averageCompletionRate = data?.length ? totalCompletionRate / data.length : 0;
    return Math.round(averageCompletionRate);
  } catch (error) {
    console.error('Region üzrə tamamlanma faizini əldə edərkən xəta:', error);
    return 0;
  }
};

// Sektor üzrə tamamlanma faizini əldə et
const fetchCompletionRateBySector = async (sectorId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('completion_rate')
      .eq('sector_id', sectorId);
      
    if (error) throw error;
    
    const totalCompletionRate = data?.reduce((sum, school) => sum + (school.completion_rate || 0), 0) || 0;
    const averageCompletionRate = data?.length ? totalCompletionRate / data.length : 0;
    return Math.round(averageCompletionRate);
  } catch (error) {
    console.error('Sektor üzrə tamamlanma faizini əldə edərkən xəta:', error);
    return 0;
  }
};

// Təsdiq gözləyən məlumatların sayını əldə et
const fetchPendingApprovalsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('data_entries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
      
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Təsdiq gözləyən məlumatların sayını əldə edərkən xəta:', error);
    return 0;
  }
};

// Region üzrə təsdiq gözləyən məlumatların sayını əldə et
const fetchPendingApprovalsByRegion = async (regionId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('data_entries')
      .select('*, schools(region_id)', { count: 'exact', head: true })
      .eq('schools.region_id', regionId)
      .eq('status', 'pending');
      
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Region üzrə təsdiq gözləyən məlumatların sayını əldə edərkən xəta:', error);
    return 0;
  }
};

// Sektor üzrə təsdiq gözləyən məlumatların sayını əldə et
const fetchPendingApprovalsBySector = async (sectorId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('data_entries')
      .select('*, schools(sector_id)', { count: 'exact', head: true })
      .eq('schools.sector_id', sectorId)
      .eq('status', 'pending');
      
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Sektor üzrə təsdiq gözləyən məlumatların sayını əldə edərkən xəta:', error);
    return 0;
  }
};

// Son bildirişləri əldə et
const fetchRecentNotifications = async (limit: number) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Son bildirişləri əldə edərkən xəta:', error);
    return [];
  }
};

// Region üzrə son bildirişləri əldə et
const fetchRecentNotificationsByRegion = async (regionId: string, limit: number) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, profiles(schools(region_id))')
      .eq('profiles.schools.region_id', regionId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Region üzrə son bildirişləri əldə edərkən xəta:', error);
    return [];
  }
};

// Sektor üzrə son bildirişləri əldə et
const fetchRecentNotificationsBySector = async (sectorId: string, limit: number) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, profiles(schools(sector_id))')
      .eq('profiles.schools.sector_id', sectorId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Sektor üzrə son bildirişləri əldə edərkən xəta:', error);
    return [];
  }
};

// Kateqoriya tamamlanma məlumatlarını əldə et
const fetchCategoryCompletionsByRegion = async (regionId: string) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name');
      
    if (error) throw error;
    
    // Real data olmadığı üçün random tamamlanma faizləri generasiya edirik
    return data.map(category => ({
      id: category.id,
      name: category.name,
      completionRate: Math.floor(Math.random() * 100),
      color: getRandomColor()
    }));
  } catch (error) {
    console.error('Kateqoriya tamamlanma məlumatlarını əldə edərkən xəta:', error);
    return [];
  }
};

// Sektor tamamlanma məlumatlarını əldə et
const fetchSectorCompletionsByRegion = async (regionId: string) => {
  try {
    const { data, error } = await supabase
      .from('sectors')
      .select('id, name');
      
    if (error) throw error;
    
    // Real data olmadığı üçün random tamamlanma faizləri generasiya edirik
    return data.map(sector => ({
      id: sector.id,
      name: sector.name,
      completionRate: Math.floor(Math.random() * 100)
    }));
  } catch (error) {
    console.error('Sektor tamamlanma məlumatlarını əldə edərkən xəta:', error);
    return [];
  }
};

// Məktəb statistikalarını əldə et
const fetchSchoolStatsBySector = async (sectorId: string) => {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('id, name, completion_rate')
      .eq('sector_id', sectorId);
      
    if (error) throw error;
    
    // Real data olmadığı üçün random pending sayı generasiya edirik
    return data.map(school => ({
      id: school.id,
      name: school.name,
      completionRate: school.completion_rate || 0,
      pending: Math.floor(Math.random() * 5)
    }));
  } catch (error) {
    console.error('Məktəb statistikalarını əldə edərkən xəta:', error);
    return [];
  }
};

// Təsdiq gözləyən məlumatları əldə et
const fetchPendingItemsBySector = async (sectorId: string) => {
  try {
    // Burda real data yoxdur deyə mock data qaytarırıq
    return [
      { id: '1', school: 'Məktəb 1', category: 'Kateqoriya A', date: '2024-07-20' },
      { id: '2', school: 'Məktəb 2', category: 'Kateqoriya B', date: '2024-07-22' },
      { id: '3', school: 'Məktəb 3', category: 'Kateqoriya C', date: '2024-07-25' }
    ];
  } catch (error) {
    console.error('Təsdiq gözləyən məlumatları əldə edərkən xəta:', error);
    return [];
  }
};

// Kateqoriya tamamlanma məlumatlarını əldə et
const fetchCategoryCompletionsBySector = async (sectorId: string) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name');
      
    if (error) throw error;
    
    // Real data olmadığı üçün random tamamlanma faizləri generasiya edirik
    return data.map(category => ({
      id: category.id,
      name: category.name,
      completionRate: Math.floor(Math.random() * 100),
      color: getRandomColor()
    }));
  } catch (error) {
    console.error('Kateqoriya tamamlanma məlumatlarını əldə edərkən xəta:', error);
    return [];
  }
};

// Aktivlik jurnalını əldə et
const fetchActivityLogBySector = async (sectorId: string) => {
  try {
    // Burda real data yoxdur deyə mock data qaytarırıq
    return [
      { id: '1', action: 'Əlavə etdi', target: 'Məlumat A', time: '1 saat əvvəl' },
      { id: '2', action: 'Yenilədi', target: 'Məlumat B', time: '2 saat əvvəl' },
      { id: '3', action: 'Sildi', target: 'Məlumat C', time: '3 saat əvvəl' }
    ];
  } catch (error) {
    console.error('Aktivlik jurnalını əldə edərkən xəta:', error);
    return [];
  }
};

// Regionların sayını əldə et
const fetchRegionsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('regions')
      .select('*', { count: 'exact', head: true });
      
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Regionların sayını əldə edərkən xəta:', error);
    return 0;
  }
};

// Sektorların sayını əldə et
const fetchSectorsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('sectors')
      .select('*', { count: 'exact', head: true });
      
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Sektorların sayını əldə edərkən xəta:', error);
    return 0;
  }
};

// Region üzrə sektorların sayını əldə et
const fetchSectorsCountByRegion = async (regionId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('sectors')
      .select('*, regions(id)', { count: 'exact', head: true })
      .eq('regions.id', regionId);
      
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Region üzrə sektorların sayını əldə edərkən xəta:', error);
    return 0;
  }
};

// Form statuslarının sayını əldə et
const fetchFormStatusCounts = async () => {
  try {
    // Burda real data yoxdur deyə mock data qaytarırıq
    return {
      pending: 15,
      approved: 85,
      rejected: 5
    };
  } catch (error) {
    console.error('Form statuslarının sayını əldə edərkən xəta:', error);
    return {
      pending: 0,
      approved: 0,
      rejected: 0
    };
  }
};

// Region statistikalarını əldə et
const fetchRegionStats = async () => {
  try {
    // Burda real data yoxdur deyə mock data qaytarırıq
    return [
      { id: '1', name: 'Bakı', sectorCount: 10, schoolCount: 120, completionRate: 75 },
      { id: '2', name: 'Gəncə', sectorCount: 5, schoolCount: 60, completionRate: 60 },
      { id: '3', name: 'Sumqayıt', sectorCount: 3, schoolCount: 40, completionRate: 80 }
    ];
  } catch (error) {
    console.error('Region statistikalarını əldə edərkən xəta:', error);
    return [];
  }
};

// Random rəng generasiya et
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Fəaliyyət məlumatlarını əldə et
const fetchActivityData = async () => {
  // Simulyasiya - Real data üçün burada API sorğusu olacaq
  return [
    { name: 'Bazar ertəsi', value: 120 },
    { name: 'Çərşənbə axşamı', value: 150 },
    { name: 'Çərşənbə', value: 180 },
    { name: 'Cümə axşamı', value: 140 },
    { name: 'Cümə', value: 190 },
    { name: 'Şənbə', value: 80 },
    { name: 'Bazar', value: 40 }
  ];
};

// Regionlardakı məktəb məlumatlarını əldə et
const fetchRegionSchoolsData = async () => {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('region_id, regions!inner(name)')
      .order('region_id');
      
    if (error) throw error;
    
    const regionCounts: {[key: string]: number} = {};
    const regionNames: {[key: string]: string} = {};
    
    data.forEach(school => {
      const regionId = school.region_id;
      const regionName = (school.regions as any).name;
      
      regionCounts[regionId] = (regionCounts[regionId] || 0) + 1;
      regionNames[regionId] = regionName;
    });
    
    return Object.keys(regionCounts).map(regionId => ({
      name: regionNames[regionId],
      value: regionCounts[regionId]
    }));
  } catch (error) {
    console.error('Region məktəb məlumatlarını əldə edərkən xəta:', error);
    // Əgər xəta baş verərsə, simulyasiya datası qaytarırıq
    return [
      { name: 'Bakı', value: 42 },
      { name: 'Gəncə', value: 28 },
      { name: 'Sumqayıt', value: 24 },
      { name: 'Lənkəran', value: 18 },
      { name: 'Mingəçevir', value: 15 }
    ];
  }
};

// Kateqoriya tamamlanma məlumatlarını əldə et
const fetchCategoryCompletionData = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');
      
    if (error) throw error;
    
    // Real data olmadığı üçün random tamamlanma faizləri generasiya edirik
    return data.map(category => ({
      name: category.name,
      completed: Math.floor(Math.random() * 100)
    }));
  } catch (error) {
    console.error('Kateqoriya tamamlanma məlumatlarını əldə edərkən xəta:', error);
    // Əgər xəta baş verərsə, simulyasiya datası qaytarırıq
    return [
      { name: 'Ümumi məlumatlar', completed: 85 },
      { name: 'Tədris planı', completed: 65 },
      { name: 'İnfrastruktur', completed: 75 },
      { name: 'Kadr potensialı', completed: 90 },
      { name: 'Büdcə', completed: 60 }
    ];
  }
};

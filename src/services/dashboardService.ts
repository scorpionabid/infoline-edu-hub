import { supabase } from '@/integrations/supabase/client';
import { generateRandomId, getRandomColor } from '@/utils/helpers';
import { DashboardData, ChartData } from '@/types/dashboard';

// Funksiya: Bütün rolların sayını əldə et
export const getAllRolesCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error("Rol saylarını əldə edərkən xəta:", error);
      throw error;
    }

    return count || 0;
  } catch (error: any) {
    console.error("Rol saylarını əldə edərkən xəta:", error);
    return 0;
  }
};

// Funksiya: Bütün istifadəçilərin sayını əldə et
export const getAllUsersCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error("İstifadəçi sayını əldə edərkən xəta:", error);
      throw error;
    }

    return count || 0;
  } catch (error: any) {
    console.error("İstifadəçi sayını əldə edərkən xəta:", error);
    return 0;
  }
};

// Supabase-də istifadəçilərin sayını əldə etmək için group əvəzinə ayrı-ayrı sorğular
export const getUsersCountByRole = async (): Promise<{ role: string; count: number }[]> => {
  try {
    const roles = ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'];
    const result = [];
    
    for (const role of roles) {
      const { count } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', role);
      
      result.push({ role, count: count || 0 });
    }
    
    return result;
  } catch (error: any) {
    console.error("Rol üzrə istifadəçi sayını əldə edərkən xəta:", error);
    return [];
  }
};

// Funksiya: Bölgələr üzrə məktəb sayını əldə et
export const getSchoolCountByRegion = async (): Promise<{ id: string; name: string; schoolCount: number }[]> => {
  try {
    const { data, error } = await supabase
      .from('regions')
      .select('id, name');

    if (error) {
      console.error("Bölgələr əldə edilərkən xəta:", error);
      throw error;
    }

    const schoolCounts = await Promise.all(
      data.map(async (region) => {
        const { count, error: schoolError } = await supabase
          .from('schools')
          .select('*', { count: 'exact', head: true })
          .eq('region_id', region.id);

        if (schoolError) {
          console.error(`Bölgə üçün məktəb sayı əldə edilərkən xəta: ${region.name}`, schoolError);
          return { ...region, schoolCount: 0 };
        }

        return { ...region, schoolCount: count || 0 };
      })
    );

    return schoolCounts.map(item => ({
      id: item.id,
      name: item.name,
      schoolCount: item.schoolCount
    }));
  } catch (error: any) {
    console.error("Bölgələr üzrə məktəb sayı əldə edilərkən xəta:", error);
    return [];
  }
};

// Funksiya: Sektorlar üzrə məktəb sayını əldə et
export const getSchoolCountBySector = async (): Promise<{ id: string; name: string; schoolCount: number }[]> => {
  try {
    const { data, error } = await supabase
      .from('sectors')
      .select('id, name');

    if (error) {
      console.error("Sektorlar əldə edilərkən xəta:", error);
      throw error;
    }

    const schoolCounts = await Promise.all(
      data.map(async (sector) => {
        const { count, error: schoolError } = await supabase
          .from('schools')
          .select('*', { count: 'exact', head: true })
          .eq('sector_id', sector.id);

        if (schoolError) {
          console.error(`Sektor üçün məktəb sayı əldə edilərkən xəta: ${sector.name}`, schoolError);
          return { ...sector, schoolCount: 0 };
        }

        return { ...sector, schoolCount: count || 0 };
      })
    );

    return schoolCounts.map(item => ({
      id: item.id,
      name: item.name,
      schoolCount: item.schoolCount
    }));
  } catch (error: any) {
    console.error("Sektorlar üzrə məktəb sayı əldə edilərkən xəta:", error);
    return [];
  }
};

// Funksiya: Məktəblərin tamamlanma faizini əldə et
export const getCompletionRateBySchool = async (): Promise<{ id: string; name: string; completionRate: number }[]> => {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('id, name, completion_rate');

    if (error) {
      console.error("Məktəblər əldə edilərkən xəta:", error);
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      completionRate: item.completion_rate || 0
    }));
  } catch (error: any) {
    console.error("Məktəblərin tamamlanma faizi əldə edilərkən xəta:", error);
    return [];
  }
};

// Funksiya: Son əlavə olunan məktəbləri əldə et
export const getLatestSchools = async (limit: number = 5): Promise<{ id: string; name: string; createdAt: string }[]> => {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Son məktəblər əldə edilərkən xəta:", error);
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      createdAt: item.created_at
    }));
  } catch (error: any) {
    console.error("Son məktəblər əldə edilərkən xəta:", error);
    return [];
  }
};

// Funksiya: Son əlavə olunan istifadəçiləri əldə et
export const getLatestUsers = async (limit: number = 5): Promise<{ id: string; fullName: string; createdAt: string }[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Son istifadəçilər əldə edilərkən xəta:", error);
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      fullName: item.full_name,
      createdAt: item.created_at
    }));
  } catch (error: any) {
    console.error("Son istifadəçilər əldə edilərkən xəta:", error);
    return [];
  }
};

// Funksiya: Tamamlanmış formların sayını əldə et
export const getCompletedFormsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('data_entries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    if (error) {
      console.error("Tamamlanmış formların sayı əldə edilərkən xəta:", error);
      throw error;
    }

    return count || 0;
  } catch (error: any) {
    console.error("Tamamlanmış formların sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Funksiya: Gözləyən formların sayını əldə et
export const getPendingFormsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('data_entries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) {
      console.error("Gözləyən formların sayı əldə edilərkən xəta:", error);
      throw error;
    }

    return count || 0;
  } catch (error: any) {
    console.error("Gözləyən formların sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Funksiya: Rədd edilmiş formların sayını əldə et
export const getRejectedFormsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('data_entries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected');

    if (error) {
      console.error("Rədd edilmiş formların sayı əldə edilərkən xəta:", error);
      throw error;
    }

    return count || 0;
  } catch (error: any) {
    console.error("Rədd edilmiş formların sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Funksiya: Bölgələr üzrə məktəb sayını qrafik üçün əldə et
export const getSchoolCountByRegionForChart = async (): Promise<{ name: string; value: number }[]> => {
  try {
    const { data: regions, error: regionsError } = await supabase
      .from('regions')
      .select('id, name');

    if (regionsError) {
      console.error("Bölgələr əldə edilərkən xəta:", regionsError);
      throw regionsError;
    }

    const regionData = await Promise.all(
      regions.map(async (region) => {
        const { data: schools, error: schoolsError } = await supabase
          .from('schools')
          .select('*', { count: 'exact', head: true })
          .eq('region_id', region.id);

        if (schoolsError) {
          console.error(`Bölgə üçün məktəb sayı əldə edilərkən xəta: ${region.name}`, schoolsError);
          return { ...region, schoolCount: 0 };
        }

        return { ...region, schoolCount: schools ? schools.length : 0 };
      })
    );

    // Qrafik üçün məlumatları formatlayıb qaytaraq
    return regionData.map(region => ({
      name: region.name,
      value: region.schoolCount
    }));
  } catch (error: any) {
    console.error("Bölgələr üzrə məktəb sayı qrafik üçün əldə edilərkən xəta:", error);
    return [];
  }
};

// Funksiya: Məktəb növləri üzrə məktəb sayını qrafik üçün əldə et
export const getSchoolCountByTypeForChart = async (): Promise<{ name: string; value: number }[]> => {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('type');

    if (error) {
      console.error("Məktəb növləri əldə edilərkən xəta:", error);
      throw error;
    }

    // Məktəb növlərini saymaq
    const typeCounts: { [key: string]: number } = {};
    data.forEach(school => {
      const type = school.type || 'Digər';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    // Qrafik üçün məlumatları formatlayıb qaytaraq
    return Object.keys(typeCounts).map(type => ({
      name: type,
      value: typeCounts[type]
    }));
  } catch (error: any) {
    console.error("Məktəb növləri üzrə məktəb sayı qrafik üçün əldə edilərkən xəta:", error);
    return [];
  }
};

// Funksiya: Aylıq yeni istifadəçi sayını qrafik üçün əldə et
export const getMonthlyNewUsersForChart = async (): Promise<{ month: string; value: number }[]> => {
  try {
    const { data, error } = await supabase.from('profiles').select('created_at');

    if (error) {
      console.error("Aylıq yeni istifadəçi sayı əldə edilərkən xəta:", error);
      throw error;
    }

    // Aylıq istifadəçi sayını hesablamaq
    const monthlyCounts: { [key: string]: number } = {};
    data.forEach(user => {
      const date = new Date(user.created_at);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    // Qrafik üçün məlumatları formatlayıb qaytaraq
    return Object.keys(monthlyCounts).map(month => ({
      month: month,
      value: monthlyCounts[month]
    }));
  } catch (error: any) {
    console.error("Aylıq yeni istifadəçi sayı qrafik üçün əldə edilərkən xəta:", error);
    return [];
  }
};

// Yeni funksiya: Dashboard məlumatlarını əldə et
export const getDashboardData = async () => {
  try {
    // İstifadəçi rolları, bölgələr, sektorlar və məktəblər üçün məlumatları əldə edirik
    const [
      { data: rolesData, error: rolesError },
      { data: regions, error: regionsError },
      { data: sectors, error: sectorsError },
      { data: schools, error: schoolsError }
    ] = await Promise.all([
      supabase.from('user_roles').select('*'),
      supabase.from('regions').select('*'),
      supabase.from('sectors').select('*'),
      supabase.from('schools').select('*')
    ]);

    if (rolesError) throw rolesError;
    if (regionsError) throw regionsError;
    if (sectorsError) throw sectorsError;
    if (schoolsError) throw schoolsError;

    // Məlumatları emal edib dashboard üçün uyğun formata gətiririk
    const totalUsers = rolesData ? rolesData.length : 0;
    const totalRegions = regions ? regions.length : 0;
    const totalSectors = sectors ? sectors.length : 0;
    const totalSchools = schools ? schools.length : 0;

    // Hər rol üzrə istifadəçi sayını hesablayaq
    const roleCounts = rolesData?.reduce((acc: any, role: any) => {
      acc[role.role] = (acc[role.role] || 0) + 1;
      return acc;
    }, {});

    // Bölgələr üzrə məktəb sayını hesablayaq
    const regionSchoolCounts = regions?.map(region => {
      const schoolsInRegion = schools?.filter(school => school.region_id === region.id);
      return {
        regionId: region.id,
        regionName: region.name,
        schoolCount: schoolsInRegion ? schoolsInRegion.length : 0
      };
    });

    // Sektorlar üzrə məktəb sayını hesablayaq
    const sectorSchoolCounts = sectors?.map(sector => {
      const schoolsInSector = schools?.filter(school => school.sector_id === sector.id);
      return {
        sectorId: sector.id,
        sectorName: sector.name,
        schoolCount: schoolsInSector ? schoolsInSector.length : 0
      };
    });

    // Dashboard üçün məlumatları bir yerə toplayaq
    const dashboardData = {
      totalUsers,
      totalRegions,
      totalSectors,
      totalSchools,
      roleCounts,
      regionSchoolCounts,
      sectorSchoolCounts
    };

    return dashboardData;
  } catch (error) {
    console.error("Dashboard məlumatlarını əldə edərkən xəta:", error);
    throw error;
  }
};

// Yeni funksiya: Bölgələr üzrə məktəb sayını əldə et
export const getRegionsWithSchoolCounts = async () => {
  try {
    // Bölgələri məktəb sayı ilə birlikdə əldə edirik
    const { data: regions, error: regionsError } = await supabase
      .from('regions')
      .select(`
        id,
        name,
        schools (
          count
        )
      `);

    if (regionsError) {
      console.error("Bölgələr əldə edilərkən xəta:", regionsError);
      throw regionsError;
    }

    // Bölgə məlumatlarını formatlayıb qaytaraq
    return regions.map(region => ({
      id: region.id,
      name: region.name,
      schools: region.schools || []
    }));
  } catch (error: any) {
    console.error("Bölgələr üzrə məktəb sayı əldə edilərkən xəta:", error);
    return [];
  }
};

// SuperAdmin üçün dashboard məlumatlarını əldə et
export const fetchSuperAdminDashboardData = async (): Promise<DashboardData> => {
  try {
    // Əsas statistika məlumatlarını əldə edək
    const [
      regionsCount,
      sectorsCount,
      schoolsCount,
      usersCount,
      completedFormsCount,
      pendingApprovalCount
    ] = await Promise.all([
      getRegionsCount(),
      getSectorsCount(),
      getSchoolsCount(),
      getAllUsersCount(),
      getCompletedFormsCount(),
      getPendingFormsCount()
    ]);
    
    // Bildirişləri əldə edək
    const notifications = await getLatestNotifications();
    
    // Tamamlanma faizi hesablayaq
    const totalForms = await getTotalFormsCount();
    const completionRate = totalForms > 0 
      ? Math.round((completedFormsCount / totalForms) * 100) 
      : 0;
    
    return {
      regions: regionsCount,
      sectors: sectorsCount,
      schools: schoolsCount,
      users: usersCount,
      completionRate,
      pendingApprovals: pendingApprovalCount,
      notifications
    };
  } catch (error) {
    console.error('SuperAdmin dashboard məlumatları əldə edilərkən xəta:', error);
    throw error;
  }
};

// RegionAdmin üçün dashboard məlumatlarını əldə et
export const fetchRegionAdminDashboardData = async (regionId: string): Promise<DashboardData> => {
  try {
    // Əsas statistika məlumatlarını əldə edək
    const [
      sectorsCount,
      schoolsCount,
      usersCount,
      completedFormsCount,
      pendingApprovalCount
    ] = await Promise.all([
      getSectorsCountByRegion(regionId),
      getSchoolsCountByRegion(regionId),
      getUsersCountByRegion(regionId),
      getCompletedFormsCountByRegion(regionId),
      getPendingFormsCountByRegion(regionId)
    ]);
    
    // Bildirişləri əldə edək
    const notifications = await getNotificationsByRegion(regionId);
    
    // Tamamlanma faizi hesablayaq
    const totalForms = await getTotalFormsCountByRegion(regionId);
    const completionRate = totalForms > 0 
      ? Math.round((completedFormsCount / totalForms) * 100) 
      : 0;
    
    return {
      sectors: sectorsCount,
      schools: schoolsCount,
      users: usersCount,
      completionRate,
      pendingApprovals: pendingApprovalCount,
      notifications
    };
  } catch (error) {
    console.error('RegionAdmin dashboard məlumatları əldə edilərkən xəta:', error);
    throw error;
  }
};

// SectorAdmin üçün dashboard məlumatlarını əldə et
export const fetchSectorAdminDashboardData = async (sectorId: string): Promise<DashboardData> => {
  try {
    // Əsas statistika məlumatlarını əldə edək
    const [
      schoolsCount,
      completedFormsCount,
      pendingApprovalCount
    ] = await Promise.all([
      getSchoolsCountBySector(sectorId),
      getCompletedFormsCountBySector(sectorId),
      getPendingFormsCountBySector(sectorId)
    ]);
    
    // Bildirişləri əldə edək
    const notifications = await getNotificationsBySector(sectorId);
    
    // Tamamlanma faizi hesablayaq
    const totalForms = await getTotalFormsCountBySector(sectorId);
    const completionRate = totalForms > 0 
      ? Math.round((completedFormsCount / totalForms) * 100) 
      : 0;
    
    return {
      schools: schoolsCount,
      completionRate,
      pendingApprovals: pendingApprovalCount,
      notifications
    };
  } catch (error) {
    console.error('SectorAdmin dashboard məlumatları əldə edilərkən xəta:', error);
    throw error;
  }
};

// Chart məlumatlarını əldə et
export const fetchDashboardChartData = async (): Promise<ChartData> => {
  try {
    // Activity data
    const [approved, pending, rejected] = await Promise.all([
      getCompletedFormsCount(),
      getPendingFormsCount(),
      getRejectedFormsCount()
    ]);
    
    const activityData = [
      { name: 'Təsdiqlənmiş', value: approved },
      { name: 'Gözləmədə', value: pending },
      { name: 'Rədd edilmiş', value: rejected }
    ];
    
    // Region schools data
    const regionsData = await getSchoolCountByRegionForChart();
    
    // Category completion data
    const categoryCompletionData = await getCategoryCompletionData();
    
    return {
      activityData,
      regionSchoolsData: regionsData,
      categoryCompletionData
    };
  } catch (error) {
    console.error('Dashboard qrafik məlumatları əldə edilərkən xəta:', error);
    throw error;
  }
};

// Region sayını əldə et
export const getRegionsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('regions')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error("Region sayı əldə edilərkən xəta:", error);
      throw error;
    }
    
    return count || 0;
  } catch (error: any) {
    console.error("Region sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Sektor sayını əldə et
export const getSectorsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('sectors')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error("Sektor sayı əldə edilərkən xəta:", error);
      throw error;
    }
    
    return count || 0;
  } catch (error: any) {
    console.error("Sektor sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Məktəb sayını əldə et
export const getSchoolsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error("Məktəb sayı əldə edilərkən xəta:", error);
      throw error;
    }
    
    return count || 0;
  } catch (error: any) {
    console.error("Məktəb sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Region üzrə sektor sayını əldə et
export const getSectorsCountByRegion = async (regionId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('sectors')
      .select('*', { count: 'exact', head: true })
      .eq('region_id', regionId);
    
    if (error) {
      console.error("Region üzrə sektor sayı əldə edilərkən xəta:", error);
      throw error;
    }
    
    return count || 0;
  } catch (error: any) {
    console.error("Region üzrə sektor sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Region üzrə məktəb sayını əldə et
export const getSchoolsCountByRegion = async (regionId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })
      .eq('region_id', regionId);
    
    if (error) {
      console.error("Region üzrə məktəb sayı əldə edilərkən xəta:", error);
      throw error;
    }
    
    return count || 0;
  } catch (error: any) {
    console.error("Region üzrə məktəb sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Sektor üzrə məktəb sayını əldə et
export const getSchoolsCountBySector = async (sectorId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })
      .eq('sector_id', sectorId);
    
    if (error) {
      console.error("Sektor üzrə məktəb sayı əldə edilərkən xəta:", error);
      throw error;
    }
    
    return count || 0;
  } catch (error: any) {
    console.error("Sektor üzrə məktəb sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Region üzrə istifadəçi sayını əldə et
export const getUsersCountByRegion = async (regionId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('region_id', regionId);
    
    if (error) {
      console.error("Region üzrə istifadəçi sayı əldə edilərkən xəta:", error);
      throw error;
    }
    
    return count || 0;
  } catch (error: any) {
    console.error("Region üzrə istifadəçi sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Tamamlanmış formların ümumi sayını əldə et
export const getTotalFormsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('data_entries')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error("Ümumi form sayı əldə edilərkən xəta:", error);
      throw error;
    }
    
    return count || 0;
  } catch (error: any) {
    console.error("Ümumi form sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Region üzrə formların ümumi sayını əldə et
export const getTotalFormsCountByRegion = async (regionId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('data_entries')
      .select('data_entries.*, schools!inner(*)')
      .eq('schools.region_id', regionId)
      .count();
    
    if (error) {
      console.error("Region üzrə ümumi form sayı əldə edilərkən xəta:", error);
      throw error;
    }
    
    return count || 0;
  } catch (error: any) {
    console.error("Region üzrə ümumi form sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Sektor üzrə formların ümumi sayını əldə et
export const getTotalFormsCountBySector = async (sectorId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('data_entries')
      .select('data_entries.*, schools!inner(*)')
      .eq('schools.sector_id', sectorId)
      .count();
    
    if (error) {
      console.error("Sektor üzrə ümumi form sayı əldə edilərkən xəta:", error);
      throw error;
    }
    
    return count || 0;
  } catch (error: any) {
    console.error("Sektor üzrə ümumi form sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Region üzrə tamamlanmış formların sayını əldə et
export const getCompletedFormsCountByRegion = async (regionId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('data_entries')
      .select('data_entries.*, schools!inner(*)')
      .eq('schools.region_id', regionId)
      .eq('data_entries.status', 'approved')
      .count();
    
    if (error) {
      console.error("Region üzrə tamamlanmış form sayı əldə edilərkən xəta:", error);
      throw error;
    }
    
    return count || 0;
  } catch (error: any) {
    console.error("Region üzrə tamamlanmış form sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Sektor üzrə tamamlanmış formların sayını əldə et
export const getCompletedFormsCountBySector = async (sectorId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('data_entries')
      .select('data_entries.*, schools!inner(*)')
      .eq('schools.sector_id', sectorId)
      .eq('data_entries.status', 'approved')
      .count();
    
    if (error) {
      console.error("Sektor üzrə tamamlanmış form sayı əldə edilərkən xəta:", error);
      throw error;
    }
    
    return count || 0;
  } catch (error: any) {
    console.error("Sektor üzrə tamamlanmış form sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Region üzrə gözləmədə olan formların sayını əldə et
export const getPendingFormsCountByRegion = async (regionId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('data_entries')
      .select('data_entries.*, schools!inner(*)')
      .eq('schools.region_id', regionId)
      .eq('data_entries.status', 'pending')
      .count();
    
    if (error) {
      console.error("Region üzrə gözləmədə olan form sayı əldə edilərkən xəta:", error);
      throw error;
    }
    
    return count || 0;
  } catch (error: any) {
    console.error("Region üzrə gözləmədə olan form sayı əldə edilərkən xəta:", error);

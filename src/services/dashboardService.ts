import { supabase } from '@/integrations/supabase/client';
import { SuperAdminDashboardData, RegionAdminDashboardData, SectorAdminDashboardData, SchoolAdminDashboardData } from '@/types/dashboard';

// İstifadə edilən Supabase Edge Function adları
const edgeFunctions = {
  superAdmin: 'get-dashboard-data-superadmin',
  regionAdmin: 'get-dashboard-data-region',
  sectorAdmin: 'get-dashboard-data-sector',
  schoolAdmin: 'get-dashboard-data-school',
  charts: 'get-activity-data-charts'
};

// Default boş məlumat strukturları
const defaultSuperAdminData: SuperAdminDashboardData = {
  stats: { totalSchools: 0, totalUsers: 0, totalForms: 0, completedForms: 0 },
  completionRate: { percentage: 0, total: 0, completed: 0 },
  regionStats: [],
  pendingApprovals: [],
  notifications: [],
  formsByStatus: { draft: 0, submitted: 0, approved: 0, rejected: 0 }
};

const defaultRegionAdminData: RegionAdminDashboardData = {
  sectors: 0,
  schools: 0,
  users: 0,
  pendingSchools: [],
  completionRate: { percentage: 0, total: 0, completed: 0 },
  notifications: [],
  sectorStats: []
};

const defaultSectorAdminData: SectorAdminDashboardData = {
  schools: 0,
  users: 0,
  pendingApprovals: [],
  completionRate: { percentage: 0, total: 0, completed: 0 },
  notifications: [],
  schoolsStats: []
};

const defaultSchoolAdminData: SchoolAdminDashboardData = {
  forms: { total: 0, completed: 0, pending: 0 },
  pendingForms: [],
  completionRate: { percentage: 0, total: 0, completed: 0 },
  notifications: [],
  recentActivity: []
};

// SuperAdmin Dashboard Data
export const getSuperAdminDashboardData = async (): Promise<SuperAdminDashboardData> => {
  try {
    // Supabase edge functiondan məlumatları əldə etməyə cəhd et
    const { data, error } = await supabase.functions.invoke(edgeFunctions.superAdmin);
    
    if (error) {
      console.error("Dashboard məlumatlarını əldə edərkən server xətası:", error);
      return defaultSuperAdminData;
    }
    
    if (!data) {
      console.warn("Server boş məlumat qaytardı, default data istifadə olunur");
      return defaultSuperAdminData;
    }
    
    // Serverdən məlumatları tipə çevir və qaytar
    if (typeof data === 'object' && data !== null) {
      // İstifadə edilən data strukturuna uyğunlaşdır
      const typedData = data as any;
      
      // Server məlumatlarını qaytar, əksik məlumatlar üçün default dəyərlərdən istifadə et
      return {
        stats: typedData.stats || defaultSuperAdminData.stats,
        completionRate: typedData.completionRate || defaultSuperAdminData.completionRate,
        regionStats: typedData.regionStats || defaultSuperAdminData.regionStats,
        pendingApprovals: typedData.pendingApprovals || defaultSuperAdminData.pendingApprovals,
        notifications: typedData.notifications || defaultSuperAdminData.notifications,
        formsByStatus: typedData.formsByStatus || defaultSuperAdminData.formsByStatus
      };
    }
    
    return defaultSuperAdminData;
  } catch (error) {
    console.error('Dashboard məlumatlarını əldə edərkən xəta:', error);
    return defaultSuperAdminData;
  }
};

// RegionAdmin Dashboard Data
export const getRegionAdminDashboardData = async (regionId: string): Promise<RegionAdminDashboardData> => {
  try {
    // Əgər regionId təqdim edilmişdirsə - server api-dən məlumatları əldə et
    if (regionId) {
      const { data, error } = await supabase.functions.invoke(edgeFunctions.regionAdmin, {
        body: { regionId }
      });
      
      if (error) {
        console.error("Region dashboard məlumatlarını əldə edərkən server xətası:", error);
        return defaultRegionAdminData;
      }
      
      if (!data) {
        console.warn("Server boş məlumat qaytardı, default data istifadə olunur");
        return defaultRegionAdminData;
      }
      
      // Serverdən məlumatları tipə çevir və qaytar
      if (typeof data === 'object' && data !== null) {
        // Tip uyğunlaşdırması
        const typedData = data as any;
        
        // Server məlumatlarını qaytar, əksik məlumatlar üçün default dəyərlərdən istifadə et
        return {
          sectors: typedData.sectors || defaultRegionAdminData.sectors,
          schools: typedData.schools || defaultRegionAdminData.schools,
          users: typedData.users || defaultRegionAdminData.users,
          pendingSchools: typedData.pendingSchools || defaultRegionAdminData.pendingSchools,
          completionRate: typedData.completionRate || defaultRegionAdminData.completionRate,
          notifications: typedData.notifications || defaultRegionAdminData.notifications,
          sectorStats: typedData.sectorStats || defaultRegionAdminData.sectorStats
        };
      }
    }
    
    return defaultRegionAdminData;
  } catch (error) {
    console.error('Region dashboard məlumatlarını əldə edərkən xəta:', error);
    return defaultRegionAdminData;
  }
};

// Sektor Admin Dashboard Data
export const getSectorAdminDashboardData = async (sectorId: string): Promise<SectorAdminDashboardData> => {
  try {
    // Əgər sectorId təqdim edilmişdirsə - server api-dən məlumatları əldə et
    if (sectorId) {
      const { data, error } = await supabase.functions.invoke(edgeFunctions.sectorAdmin, {
        body: { sectorId }
      });
      
      if (error) {
        console.error("Sektor dashboard məlumatlarını əldə edərkən server xətası:", error);
        return defaultSectorAdminData;
      }
      
      if (!data) {
        console.warn("Server boş məlumat qaytardı, default data istifadə olunur");
        return defaultSectorAdminData;
      }
      
      // Serverdən məlumatları tipə çevir və qaytar
      if (typeof data === 'object' && data !== null) {
        // Tip uyğunlaşdırması
        const typedData = data as any;
        
        // Server məlumatlarını qaytar, əksik məlumatlar üçün default dəyərlərdən istifadə et
        return {
          schools: typedData.schools || defaultSectorAdminData.schools,
          users: typedData.users || defaultSectorAdminData.users,
          pendingApprovals: typedData.pendingApprovals || defaultSectorAdminData.pendingApprovals,
          completionRate: typedData.completionRate || defaultSectorAdminData.completionRate,
          notifications: typedData.notifications || defaultSectorAdminData.notifications,
          schoolsStats: typedData.schoolsStats || defaultSectorAdminData.schoolsStats
        };
      }
    }
    
    return defaultSectorAdminData;
  } catch (error) {
    console.error('Sektor dashboard məlumatlarını əldə edərkən xəta:', error);
    return defaultSectorAdminData;
  }
};

// Məktəb Admin Dashboard Data
export const getSchoolAdminDashboardData = async (schoolId: string): Promise<SchoolAdminDashboardData> => {
  try {
    // Əgər schoolId təqdim edilmişdirsə - server api-dən məlumatları əldə et
    if (schoolId) {
      const { data, error } = await supabase.functions.invoke(edgeFunctions.schoolAdmin, {
        body: { schoolId }
      });
      
      if (error) {
        console.error("Məktəb dashboard məlumatlarını əldə edərkən server xətası:", error);
        return defaultSchoolAdminData;
      }
      
      if (!data) {
        console.warn("Server boş məlumat qaytardı, default data istifadə olunur");
        return defaultSchoolAdminData;
      }
      
      // Serverdən məlumatları tipə çevir və qaytar
      if (typeof data === 'object' && data !== null) {
        // Tip uyğunlaşdırması
        const typedData = data as any;
        
        // Server məlumatlarını qaytar, əksik məlumatlar üçün default dəyərlərdən istifadə et
        return {
          forms: typedData.forms || defaultSchoolAdminData.forms,
          pendingForms: typedData.pendingForms || defaultSchoolAdminData.pendingForms,
          completionRate: typedData.completionRate || defaultSchoolAdminData.completionRate,
          notifications: typedData.notifications || defaultSchoolAdminData.notifications,
          recentActivity: typedData.recentActivity || defaultSchoolAdminData.recentActivity
        };
      }
    }
    
    return defaultSchoolAdminData;
  } catch (error) {
    console.error('Məktəb dashboard məlumatlarını əldə edərkən xəta:', error);
    return defaultSchoolAdminData;
  }
};

// Diagramlar üçün aktivlik məlumatları
export const getDashboardChartData = async (params: { 
  startDate?: string; 
  endDate?: string;
  entityType?: 'region' | 'sector' | 'school';
  entityId?: string;
}) => {
  try {
    // Server api-dən məlumatları əldə et
    const { data, error } = await supabase.functions.invoke(edgeFunctions.charts, {
      body: params
    });
    
    if (error) {
      console.error("Diaqram məlumatlarını əldə edərkən server xətası:", error);
      return {
        activityByDate: [],
        activityBySchool: []
      };
    }
    
    if (!data) {
      console.warn("Server boş məlumat qaytardı, default data istifadə olunur");
      return {
        activityByDate: [],
        activityBySchool: []
      };
    }
    
    return data;
  } catch (error) {
    console.error("Diaqram məlumatlarını əldə edərkən xəta:", error);
    return {
      activityByDate: [],
      activityBySchool: []
    };
  }
};

// API funksiyalarını export et
export const fetchSuperAdminDashboard = getSuperAdminDashboardData;
export const fetchRegionAdminDashboard = getRegionAdminDashboardData;
export const fetchSectorAdminDashboard = getSectorAdminDashboardData;
export const fetchSchoolAdminDashboard = getSchoolAdminDashboardData;
export const fetchDashboardChartData = getDashboardChartData;

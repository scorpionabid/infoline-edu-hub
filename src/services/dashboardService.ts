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
  stats: { regions: 0, sectors: 0, schools: 0, users: 0 },
  regionCount: 0,
  sectorCount: 0,
  schoolCount: 0,
  userCount: 0,
  approvalRate: 0,
  completionRate: 0,
  regions: [],
  pendingApprovals: [],
  notifications: [],
  formsByStatus: { pending: 0, approved: 0, rejected: 0, total: 0 }
};

const defaultRegionAdminData: RegionAdminDashboardData = {
  stats: { sectors: 0, schools: 0, users: 0 },
  pendingItems: [],
  categories: [],
  sectors: [],
  notifications: [],
  completionRate: 0
};

const defaultSectorAdminData: SectorAdminDashboardData = {
  stats: { schools: 0 },
  pendingItems: [],
  schools: [],
  categories: [],
  notifications: [],
  completionRate: 0
};

const defaultSchoolAdminData: SchoolAdminDashboardData = {
  formStats: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    drafts: 0,
    incomplete: 0
  },
  categories: [],
  notifications: [],
  completionRate: 0
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
        regionCount: typedData.regionCount || defaultSuperAdminData.regionCount,
        sectorCount: typedData.sectorCount || defaultSuperAdminData.sectorCount,
        schoolCount: typedData.schoolCount || defaultSuperAdminData.schoolCount,
        userCount: typedData.userCount || defaultSuperAdminData.userCount,
        approvalRate: typedData.approvalRate || defaultSuperAdminData.approvalRate,
        completionRate: typedData.completionRate || defaultSuperAdminData.completionRate,
        regions: typedData.regions || defaultSuperAdminData.regions,
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
          stats: typedData.stats || defaultRegionAdminData.stats,
          pendingItems: typedData.pendingItems || defaultRegionAdminData.pendingItems,
          categories: typedData.categories || defaultRegionAdminData.categories,
          sectors: typedData.sectors || defaultRegionAdminData.sectors,
          notifications: typedData.notifications || defaultRegionAdminData.notifications,
          completionRate: typedData.completionRate || defaultRegionAdminData.completionRate
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
          stats: typedData.stats || defaultSectorAdminData.stats,
          pendingItems: typedData.pendingItems || defaultSectorAdminData.pendingItems,
          schools: typedData.schools || defaultSectorAdminData.schools,
          categories: typedData.categories || defaultSectorAdminData.categories,
          notifications: typedData.notifications || defaultSectorAdminData.notifications,
          completionRate: typedData.completionRate || defaultSectorAdminData.completionRate
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
          formStats: typedData.formStats || defaultSchoolAdminData.formStats,
          categories: typedData.categories || defaultSchoolAdminData.categories,
          notifications: typedData.notifications || defaultSchoolAdminData.notifications,
          completionRate: typedData.completionRate || defaultSchoolAdminData.completionRate
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

// Rol əsasında uyğun dashboard məlumatlarını gətirən funksiya
export const fetchDashboardData = async (userRole: string, entityId?: string) => {
  console.log(`Fetching dashboard data for role: ${userRole}, entityId: ${entityId}`);
  
  switch (userRole.toLowerCase()) {
    case 'superadmin':
      return await fetchSuperAdminDashboard();
    case 'regionadmin':
      if (!entityId) throw new Error('Region ID tələb olunur');
      return await fetchRegionAdminDashboard(entityId);
    case 'sectoradmin':
      if (!entityId) throw new Error('Sektor ID tələb olunur');
      return await fetchSectorAdminDashboard(entityId);
    case 'schooladmin':
      if (!entityId) throw new Error('Məktəb ID tələb olunur');
      return await fetchSchoolAdminDashboard(entityId);
    default:
      throw new Error(`${userRole} rolu üçün göstərgə paneli məlumatları mövcud deyil`);
  }
};

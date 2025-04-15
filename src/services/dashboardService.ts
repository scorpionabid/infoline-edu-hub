
import { supabase } from '@/integrations/supabase/client';
import { DashboardData, SuperAdminDashboardData, RegionAdminDashboardData, SectorAdminDashboardData, SchoolAdminDashboardData } from '@/types/dashboard';
import { mockSuperAdminDashboard, mockRegionAdminDashboard, mockSectorAdminDashboard, mockSchoolAdminDashboard } from '@/data/dashboard';

// İstifadə edilən Supabase Edge Function adları
const edgeFunctions = {
  superAdmin: 'get-dashboard-data-superadmin',
  regionAdmin: 'get-dashboard-data-region',
  sectorAdmin: 'get-dashboard-data-sector',
  schoolAdmin: 'get-dashboard-data-school',
  charts: 'get-activity-data-charts'
};

// SuperAdmin Dashboard Data
export const getSuperAdminDashboardData = async (): Promise<SuperAdminDashboardData> => {
  try {
    // Real məlumatları serverə sorğu ilə əldə etmək üçün
    const mockData = mockSuperAdminDashboard();
    
    try {
      // Supabase edge functiondan məlumatları əldə etməyə cəhd et
      const { data, error } = await supabase.functions.invoke(edgeFunctions.superAdmin);
      
      if (error) {
        console.error("Dashboard məlumatlarını əldə edərkən server xətası:", error);
        return mockData;
      }
      
      if (!data) {
        console.warn("Server boş məlumat qaytardı, mock data istifadə olunur");
        return mockData;
      }
      
      // Serverdən məlumatları tipə çevir və qaytar
      if (typeof data === 'object' && data !== null) {
        // İstifadə edilən data strukturuna uyğunlaşdır
        const typedData = data as any;
        
        // Mock data əvəzinə server məlumatlarını qaytar
        return {
          ...mockData,
          // Server tərəfindən təqdim edilən məlumatları əlavə et
          stats: typedData.stats || mockData.stats,
          completionRate: typedData.completionRate || mockData.completionRate,
          regionStats: typedData.regionStats || mockData.regionStats,
          pendingApprovals: typedData.pendingApprovals || mockData.pendingApprovals,
          notifications: typedData.notifications || mockData.notifications,
          // Formlar üçün ətraflı məlumatlar
          formsByStatus: typedData.formsByStatus || mockData.formsByStatus
        };
      }
      
      return mockData;
    } catch (error) {
      console.error("Dashboard məlumatlarını əldə edərkən xəta:", error);
      return mockData;
    }
  } catch (error) {
    console.error('Dashboard məlumatlarını əldə edərkən xəta:', error);
    return mockSuperAdminDashboard();
  }
};

// RegionAdmin Dashboard Data
export const getRegionAdminDashboardData = async (regionId: string): Promise<RegionAdminDashboardData> => {
  try {
    // Başlanğıc olaraq mock data istifadə edirik
    const mockData = mockRegionAdminDashboard();
    
    try {
      // Əgər regionId təqdim edilmişdirsə - server api-dən məlumatları əldə et
      if (regionId) {
        const { data, error } = await supabase.functions.invoke(edgeFunctions.regionAdmin, {
          body: { regionId }
        });
        
        if (error) {
          console.error("Region dashboard məlumatlarını əldə edərkən server xətası:", error);
          return mockData;
        }
        
        if (!data) {
          console.warn("Server boş məlumat qaytardı, mock data istifadə olunur");
          return mockData;
        }
        
        // Serverdən məlumatları tipə çevir və qaytar
        if (typeof data === 'object' && data !== null) {
          // Tip uyğunlaşdırması
          const typedData = data as any;
          
          // Mock data əvəzinə server məlumatlarını qaytar
          return {
            ...mockData,
            // TypeScript xətası üçün əlavə kontrol
            sectors: typedData.sectors || mockData.sectors,
            schools: typedData.schools || mockData.schools,
            users: typedData.users || mockData.users,
            pendingSchools: typedData.pendingSchools || mockData.pendingSchools,
            completionRate: typedData.completionRate || mockData.completionRate,
            notifications: typedData.notifications || mockData.notifications,
            sectorStats: typedData.sectorStats || mockData.sectorStats
          };
        }
      }
      
      return mockData;
    } catch (error) {
      console.error("Region dashboard məlumatlarını əldə edərkən xəta:", error);
      return mockData;
    }
  } catch (error) {
    console.error('Region dashboard məlumatlarını əldə edərkən xəta:', error);
    return mockRegionAdminDashboard();
  }
};

// Sektor Admin Dashboard Data
export const getSectorAdminDashboardData = async (sectorId: string): Promise<SectorAdminDashboardData> => {
  try {
    // Başlanğıc olaraq mock data istifadə edirik
    const mockData = mockSectorAdminDashboard();
    
    try {
      // Əgər sectorId təqdim edilmişdirsə - server api-dən məlumatları əldə et
      if (sectorId) {
        const { data, error } = await supabase.functions.invoke(edgeFunctions.sectorAdmin, {
          body: { sectorId }
        });
        
        if (error) {
          console.error("Sektor dashboard məlumatlarını əldə edərkən server xətası:", error);
          return mockData;
        }
        
        if (!data) {
          console.warn("Server boş məlumat qaytardı, mock data istifadə olunur");
          return mockData;
        }
        
        // Serverdən məlumatları tipə çevir və qaytar
        if (typeof data === 'object' && data !== null) {
          // Tip uyğunlaşdırması
          const typedData = data as any;
          
          // Mock data əvəzinə server məlumatlarını qaytar
          return {
            ...mockData,
            schools: typedData.schools || mockData.schools,
            users: typedData.users || mockData.users,
            pendingApprovals: typedData.pendingApprovals || mockData.pendingApprovals,
            completionRate: typedData.completionRate || mockData.completionRate,
            notifications: typedData.notifications || mockData.notifications,
            schoolsStats: typedData.schoolsStats || mockData.schoolsStats
          };
        }
      }
      
      return mockData;
    } catch (error) {
      console.error("Sektor dashboard məlumatlarını əldə edərkən xəta:", error);
      return mockData;
    }
  } catch (error) {
    console.error('Sektor dashboard məlumatlarını əldə edərkən xəta:', error);
    return mockSectorAdminDashboard();
  }
};

// Məktəb Admin Dashboard Data
export const getSchoolAdminDashboardData = async (schoolId: string): Promise<SchoolAdminDashboardData> => {
  try {
    // Başlanğıc olaraq mock data istifadə edirik
    const mockData = mockSchoolAdminDashboard();
    
    try {
      // Əgər schoolId təqdim edilmişdirsə - server api-dən məlumatları əldə et
      if (schoolId) {
        const { data, error } = await supabase.functions.invoke(edgeFunctions.schoolAdmin, {
          body: { schoolId }
        });
        
        if (error) {
          console.error("Məktəb dashboard məlumatlarını əldə edərkən server xətası:", error);
          return mockData;
        }
        
        if (!data) {
          console.warn("Server boş məlumat qaytardı, mock data istifadə olunur");
          return mockData;
        }
        
        // Serverdən məlumatları tipə çevir və qaytar
        if (typeof data === 'object' && data !== null) {
          // Tip uyğunlaşdırması
          const typedData = data as any;
          
          // Mock data əvəzinə server məlumatlarını qaytar
          return {
            ...mockData,
            forms: typedData.forms || mockData.forms,
            pendingForms: typedData.pendingForms || mockData.pendingForms,
            completionRate: typedData.completionRate || mockData.completionRate,
            notifications: typedData.notifications || mockData.notifications
          };
        }
      }
      
      return mockData;
    } catch (error) {
      console.error("Məktəb dashboard məlumatlarını əldə edərkən xəta:", error);
      return mockData;
    }
  } catch (error) {
    console.error('Məktəb dashboard məlumatlarını əldə edərkən xəta:', error);
    return mockSchoolAdminDashboard();
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
    // Sadə mock data qaytarırıq
    const mockChartData = {
      activityByDate: [
        { date: '2023-01-01', count: 5 },
        { date: '2023-01-02', count: 7 },
        { date: '2023-01-03', count: 2 },
        { date: '2023-01-04', count: 9 },
        { date: '2023-01-05', count: 12 },
      ],
      activityBySchool: [
        { name: 'Məktəb 1', count: 15 },
        { name: 'Məktəb 2', count: 8 },
        { name: 'Məktəb 3', count: 12 },
        { name: 'Məktəb 4', count: 5 },
        { name: 'Məktəb 5', count: 20 },
      ]
    };
    
    try {
      // Server api-dən məlumatları əldə et
      const { data, error } = await supabase.functions.invoke(edgeFunctions.charts, {
        body: params
      });
      
      if (error) {
        console.error("Diaqram məlumatlarını əldə edərkən server xətası:", error);
        return mockChartData;
      }
      
      if (!data) {
        console.warn("Server boş məlumat qaytardı, mock data istifadə olunur");
        return mockChartData;
      }
      
      return data;
    } catch (error) {
      console.error("Diaqram məlumatlarını əldə edərkən xəta:", error);
      return mockChartData;
    }
  } catch (error) {
    console.error('Diaqram məlumatlarını əldə edərkən xəta:', error);
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

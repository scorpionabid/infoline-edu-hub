
import { supabase } from '@/integrations/supabase/client';

interface FetchDashboardDataParams {
  userRole?: string | null;
  regionId?: string | null;
  sectorId?: string | null;
  schoolId?: string | null;
  startDate?: string;
  endDate?: string;
}

export const fetchDashboardData = async (params: FetchDashboardDataParams) => {
  const { userRole, regionId, sectorId, schoolId } = params;
  
  try {
    console.log('Dashboard məlumatları əldə edilir:', { userRole, regionId, sectorId, schoolId });
    
    // SuperAdmin üçün məlumatlar
    if (userRole === 'superadmin') {
      // Ümumi statistika məlumatlarını əldə edirik
      const { data: regionCount, error: regionError } = await supabase
        .from('regions')
        .select('*', { count: 'exact', head: true });
      
      const { data: sectorCount, error: sectorError } = await supabase
        .from('sectors')
        .select('*', { count: 'exact', head: true });
      
      const { data: schoolCount, error: schoolError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true });
      
      const { data: userCount, error: userError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true });
      
      if (regionError || sectorError || schoolError || userError) {
        console.error('Statistika məlumatları əldə edilərkən xəta:', {
          regionError, sectorError, schoolError, userError
        });
        throw new Error('Dashboard məlumatları əldə edilərkən xəta baş verdi');
      }
      
      // Tamamlanma faizini hesablayırıq - bu fake məlumat olaraq qalır, əsas məntiq verilənlər bazasında olmalıdır
      const completionRate = 65; // Fake data
      
      return {
        regions: regionCount?.count || 0,
        sectors: sectorCount?.count || 0,
        schools: schoolCount?.count || 0,
        users: userCount?.count || 0,
        completionRate,
        // İstəyə uyğun digər məlumatlar da əlavə edilə bilər
      };
    }
    
    // RegionAdmin üçün məlumatlar
    if (userRole === 'regionadmin' && regionId) {
      const { data: sectorCount, error: sectorError } = await supabase
        .from('sectors')
        .select('*', { count: 'exact', head: true })
        .eq('region_id', regionId);
      
      const { data: schoolCount, error: schoolError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('region_id', regionId);
      
      const { data: userCount, error: userError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('region_id', regionId);
      
      // Aktiv və natamam məktəbləri hesablayırıq
      const { data: activeSchools, error: activeError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('region_id', regionId)
        .eq('status', 'active');
        
      const { data: incompleteSchools, error: incompleteError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('region_id', regionId)
        .eq('completion_rate', 0);
      
      if (sectorError || schoolError || userError || activeError || incompleteError) {
        console.error('Region statistika məlumatları əldə edilərkən xəta:', {
          sectorError, schoolError, userError, activeError, incompleteError
        });
        throw new Error('Region dashboard məlumatları əldə edilərkən xəta baş verdi');
      }
      
      // Region üçün tamamlanma faizini hesablayırıq
      const completionRate = 70; // Fake data
      
      return {
        sectors: sectorCount?.count || 0,
        schools: schoolCount?.count || 0,
        users: userCount?.count || 0,
        activeSectors: sectorCount?.count || 0, // Active və deaktiv sektorları ayırmaq üçün əlavə sorğu lazımdır
        activeSchools: activeSchools?.count || 0,
        incompleteSchools: incompleteSchools?.count || 0,
        completionRate,
      };
    }
    
    // SectorAdmin üçün məlumatlar
    if (userRole === 'sectoradmin' && sectorId) {
      const { data: schoolCount, error: schoolError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('sector_id', sectorId);
      
      const { data: userCount, error: userError } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('sector_id', sectorId);
      
      // Aktiv və natamam məktəbləri hesablayırıq
      const { data: activeSchools, error: activeError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('sector_id', sectorId)
        .eq('status', 'active');
        
      const { data: incompleteSchools, error: incompleteError } = await supabase
        .from('schools')
        .select('*', { count: 'exact', head: true })
        .eq('sector_id', sectorId)
        .eq('completion_rate', 0);
      
      if (schoolError || userError || activeError || incompleteError) {
        console.error('Sektor statistika məlumatları əldə edilərkən xəta:', {
          schoolError, userError, activeError, incompleteError
        });
        throw new Error('Sektor dashboard məlumatları əldə edilərkən xəta baş verdi');
      }
      
      // Sektor üçün tamamlanma faizini hesablayırıq
      const completionRate = 75; // Fake data
      
      return {
        schools: schoolCount?.count || 0,
        users: userCount?.count || 0,
        activeSchools: activeSchools?.count || 0,
        incompleteSchools: incompleteSchools?.count || 0,
        completionRate,
      };
    }
    
    // SchoolAdmin üçün məlumatlar
    if (userRole === 'schooladmin' && schoolId) {
      // Müxtəlif statuslu formların sayını hesablayırıq
      const { data: formStats, error: formError } = await supabase
        .rpc('get_school_form_stats', { p_school_id: schoolId });
      
      if (formError) {
        console.error('Məktəb form statistikası əldə edilərkən xəta:', formError);
        // Form statistikası əldə edilməsə belə, boş məlumatlar ilə davam edirik
      }
      
      // Məktəb üçün tamamlanma faizini hesablayırıq
      const { data: completionData, error: completionError } = await supabase
        .rpc('calculate_completion_rate', { school_id_param: schoolId });
      
      if (completionError) {
        console.error('Məktəb tamamlanma faizi hesablanarkən xəta:', completionError);
      }
      
      // Şablon form məlumatları
      const stats = formStats?.[0] || {
        total_forms: 0,
        approved_forms: 0,
        pending_forms: 0,
        rejected_forms: 0,
        incomplete_forms: 0,
        draft_forms: 0
      };
      
      return {
        totalForms: stats.total_forms || 0,
        approvedForms: stats.approved_forms || 0,
        pendingForms: stats.pending_forms || 0,
        rejectedForms: stats.rejected_forms || 0,
        incompleteForms: stats.incomplete_forms || 0,
        draftForms: stats.draft_forms || 0,
        completionRate: completionData || 0,
      };
    }
    
    // Default case - minimum məlumatlar qaytarırıq
    return {
      completionRate: 0,
      regions: 0,
      sectors: 0,
      schools: 0,
      users: 0
    };
    
  } catch (error: any) {
    console.error('Dashboard məlumatları əldə edilərkən xəta:', error);
    throw new Error(error.message || 'Dashboard məlumatları əldə edilərkən xəta baş verdi');
  }
};

// Activity data əldə etmək üçün funksiya
export const fetchActivityData = async (params: {
  startDate?: string;
  endDate?: string;
  entityType?: 'region' | 'sector' | 'school';
  entityId?: string;
}) => {
  try {
    const { startDate, endDate, entityType, entityId } = params;
    
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    
    if (entityType && entityId) {
      query = query.eq('entity_type', entityType).eq('entity_id', entityId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error: any) {
    console.error('Fəaliyyət məlumatları əldə edilərkən xəta:', error);
    throw new Error(error.message || 'Fəaliyyət məlumatları əldə edilərkən xəta baş verdi');
  }
};

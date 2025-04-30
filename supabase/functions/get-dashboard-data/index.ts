
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS başlıqları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight sorğularına cavab ver
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Supabase client yaratma
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase konfiqurasiyası: URL və ya key tapılmadı');
      return new Response(
        JSON.stringify({ error: 'Server konfiqurasiyası səhvdir' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Auth başlığını al
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Authorization başlığı təqdim edilməyib');
      return new Response(
        JSON.stringify({ error: 'Authorization başlığı tələb olunur' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // JWT token-ini əldə et
    const token = authHeader.replace('Bearer ', '');
    
    // İstifadəçi məlumatlarını al
    const { data: user, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user.user) {
      console.error('JWT token yoxlaması zamanı xəta:', userError);
      return new Response(
        JSON.stringify({ error: 'Avtorizasiya xətası - token doğrulanmadı' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Request body-ni alaq (əgər varsa)
    let body = {};
    try {
      if (req.bodyUsed) {
        body = await req.json();
      }
    } catch (error) {
      // Body-ni parse etmək mütləq deyil, boş obyektlə davam edirik
      console.log('Body parse edilmədi, davam edirik');
    }
    
    // İstifadəçinin rolunu yoxla
    const { data: userRoleData, error: userRoleError } = await supabase
      .from("user_roles")
      .select("role, region_id, sector_id, school_id")
      .eq("user_id", user.user.id)
      .single();
    
    if (userRoleError) {
      console.error('İstifadəçi rolu sorğusu xətası:', userRoleError);
      return new Response(
        JSON.stringify({ error: 'İstifadəçi rolu tapılmadı' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    const role = body.role || userRoleData.role;
    let dashboardData;
    
    // Rola və parametrlərə görə dashboard məlumatlarını hazırla
    switch (role) {
      case 'superadmin':
        // SuperAdmin üçün ümumi statistika
        dashboardData = await generateSuperAdminDashboard(supabase);
        break;
        
      case 'regionadmin':
        // Region admin-i üçün, region ID istifadə et
        const regionId = userRoleData.region_id;
        if (!regionId) {
          return new Response(
            JSON.stringify({ error: 'Region ID tapılmadı' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        dashboardData = await generateRegionAdminDashboard(supabase, regionId);
        break;
        
      case 'sectoradmin':
        // Sektor admin-i üçün, sektor ID istifadə et
        const sectorId = userRoleData.sector_id;
        if (!sectorId) {
          return new Response(
            JSON.stringify({ error: 'Sektor ID tapılmadı' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        dashboardData = await generateSectorAdminDashboard(supabase, sectorId);
        break;
        
      case 'schooladmin':
        // Məktəb admin-i üçün, məktəb ID istifadə et
        const schoolId = userRoleData.school_id;
        if (!schoolId) {
          return new Response(
            JSON.stringify({ error: 'Məktəb ID tapılmadı' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        dashboardData = await generateSchoolAdminDashboard(supabase, schoolId);
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Dəstəklənməyən rol' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
    }
    
    // Uğurlu cavab
    return new Response(
      JSON.stringify(dashboardData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Gözlənilməz xəta:', error);
    return new Response(
      JSON.stringify({ 
        error: `Gözlənilməz xəta: ${error instanceof Error ? error.message : String(error)}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// SuperAdmin üçün dashboard məlumatlarını hazırlayan funksiya
async function generateSuperAdminDashboard(supabase) {
  try {
    // Regionlar haqqında məlumat
    const { data: regions, error: regionsError } = await supabase
      .from('regions')
      .select('*');
    
    if (regionsError) throw regionsError;
    
    // Sektorlar haqqında məlumat
    const { data: sectors, error: sectorsError } = await supabase
      .from('sectors')
      .select('*');
    
    if (sectorsError) throw sectorsError;
    
    // Məktəblər haqqında məlumat
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('*');
    
    if (schoolsError) throw schoolsError;
    
    // İstifadəçilər haqqında məlumat
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('*');
    
    if (usersError) throw usersError;
    
    // Məlumatların tamamlanması haqqında statistika
    const { data: entries, error: entriesError } = await supabase
      .from('data_entries')
      .select('*');
    
    if (entriesError) throw entriesError;
    
    // Daxiletmələr statistikası
    const totalEntries = entries?.length || 0;
    const approvedEntries = entries?.filter(entry => entry.status === 'approved')?.length || 0;
    const pendingEntries = entries?.filter(entry => entry.status === 'pending')?.length || 0;
    const rejectedEntries = entries?.filter(entry => entry.status === 'rejected')?.length || 0;
    
    // Tamamlanma dərəcəsi
    const completionRate = totalEntries > 0 
      ? Math.round((approvedEntries / totalEntries) * 100) 
      : 0;
    
    // Təsdiqləmə dərəcəsi
    const approvalRate = (approvedEntries + rejectedEntries) > 0 
      ? Math.round((approvedEntries / (approvedEntries + rejectedEntries)) * 100) 
      : 0;
    
    return {
      regions: {
        total: regions?.length || 0,
        active: regions?.filter(r => r.status === 'active')?.length || 0
      },
      sectors: {
        total: sectors?.length || 0,
        active: sectors?.filter(s => s.status === 'active')?.length || 0
      },
      schools: {
        total: schools?.length || 0,
        active: schools?.filter(s => s.status === 'active')?.length || 0
      },
      users: {
        total: users?.length || 0,
        active: users?.filter(u => u.status === 'active')?.length || 0
      },
      stats: {
        total_entries: totalEntries,
        approved_entries: approvedEntries,
        pending_entries: pendingEntries,
        rejected_entries: rejectedEntries,
        completion_rate: completionRate,
        approval_rate: approvalRate
      }
    };
  } catch (error) {
    console.error('SuperAdmin dashboard yaratma xətası:', error);
    throw error;
  }
}

// Region Admin üçün dashboard məlumatlarını hazırlayan funksiya
async function generateRegionAdminDashboard(supabase, regionId) {
  try {
    // Region haqqında məlumat
    const { data: region, error: regionError } = await supabase
      .from('regions')
      .select('*')
      .eq('id', regionId)
      .single();
    
    if (regionError) throw regionError;
    
    // Region-a aid sektorlar
    const { data: sectors, error: sectorsError } = await supabase
      .from('sectors')
      .select('*')
      .eq('region_id', regionId);
    
    if (sectorsError) throw sectorsError;
    
    // Region-a aid məktəblər
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('*')
      .eq('region_id', regionId);
    
    if (schoolsError) throw schoolsError;
    
    // Region-a aid məlumat daxiletmələri
    const { data: entries, error: entriesError } = await supabase
      .from('data_entries')
      .select('*, schools!inner(*)')
      .eq('schools.region_id', regionId);
    
    if (entriesError) throw entriesError;
    
    // Statistika
    const totalEntries = entries?.length || 0;
    const approvedEntries = entries?.filter(entry => entry.status === 'approved')?.length || 0;
    const pendingEntries = entries?.filter(entry => entry.status === 'pending')?.length || 0;
    const rejectedEntries = entries?.filter(entry => entry.status === 'rejected')?.length || 0;
    
    // Tamamlanma dərəcəsi
    const completionRate = totalEntries > 0 
      ? Math.round((approvedEntries / totalEntries) * 100) 
      : 0;
    
    // Məktəblər sayı
    const pendingSchools = new Set(entries
      ?.filter(entry => entry.status === 'pending')
      ?.map(entry => entry.school_id)).size;
    
    return {
      region: {
        id: region.id,
        name: region.name,
        description: region.description,
        status: region.status
      },
      sectors: {
        total: sectors?.length || 0,
        active: sectors?.filter(s => s.status === 'active')?.length || 0
      },
      schools: {
        total: schools?.length || 0,
        active: schools?.filter(s => s.status === 'active')?.length || 0
      },
      stats: {
        total_entries: totalEntries,
        approved_entries: approvedEntries,
        pending_entries: pendingEntries,
        rejected_entries: rejectedEntries,
        completion_rate: completionRate,
        pending_count: pendingEntries,
        pending_schools: pendingSchools
      }
    };
  } catch (error) {
    console.error('Region Admin dashboard yaratma xətası:', error);
    throw error;
  }
}

// Sektor Admin üçün dashboard məlumatlarını hazırlayan funksiya
async function generateSectorAdminDashboard(supabase, sectorId) {
  try {
    // Sektor haqqında məlumat
    const { data: sector, error: sectorError } = await supabase
      .from('sectors')
      .select('*, regions(*)')
      .eq('id', sectorId)
      .single();
    
    if (sectorError) throw sectorError;
    
    // Sektora aid məktəblər
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('*')
      .eq('sector_id', sectorId);
    
    if (schoolsError) throw schoolsError;
    
    // Sektora aid məlumat daxiletmələri
    const { data: entries, error: entriesError } = await supabase
      .from('data_entries')
      .select('*, schools!inner(*)')
      .eq('schools.sector_id', sectorId);
    
    if (entriesError) throw entriesError;
    
    // Statistika
    const totalEntries = entries?.length || 0;
    const approvedEntries = entries?.filter(entry => entry.status === 'approved')?.length || 0;
    const pendingEntries = entries?.filter(entry => entry.status === 'pending')?.length || 0;
    const rejectedEntries = entries?.filter(entry => entry.status === 'rejected')?.length || 0;
    
    // Tamamlanma dərəcəsi
    const completionRate = totalEntries > 0 
      ? Math.round((approvedEntries / totalEntries) * 100) 
      : 0;
    
    // Məktəblər sayı
    const pendingSchools = new Set(entries
      ?.filter(entry => entry.status === 'pending')
      ?.map(entry => entry.school_id)).size;
    
    return {
      region: {
        id: sector.regions.id,
        name: sector.regions.name
      },
      sector: {
        id: sector.id,
        name: sector.name,
        description: sector.description,
        status: sector.status,
        completion_rate: sector.completion_rate
      },
      schools: {
        total: schools?.length || 0,
        active: schools?.filter(s => s.status === 'active')?.length || 0
      },
      stats: {
        total_entries: totalEntries,
        approved_entries: approvedEntries,
        pending_entries: pendingEntries,
        rejected_entries: rejectedEntries,
        completion_rate: completionRate,
        pending_count: pendingEntries,
        pending_schools: pendingSchools
      }
    };
  } catch (error) {
    console.error('Sektor Admin dashboard yaratma xətası:', error);
    throw error;
  }
}

// Məktəb Admin üçün dashboard məlumatlarını hazırlayan funksiya
async function generateSchoolAdminDashboard(supabase, schoolId) {
  try {
    // Məktəb haqqında məlumat
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('*, sectors(*), regions(*)')
      .eq('id', schoolId)
      .single();
    
    if (schoolError) throw schoolError;
    
    // Məktəbə aid məlumat daxiletmələri
    const { data: entries, error: entriesError } = await supabase
      .from('data_entries')
      .select('*')
      .eq('school_id', schoolId);
    
    if (entriesError) throw entriesError;
    
    // Kateqoriyalar
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('status', 'active');
      
    if (categoriesError) throw categoriesError;
    
    // Statistika
    const totalEntries = entries?.length || 0;
    const approvedEntries = entries?.filter(entry => entry.status === 'approved')?.length || 0;
    const pendingEntries = entries?.filter(entry => entry.status === 'pending')?.length || 0;
    const rejectedEntries = entries?.filter(entry => entry.status === 'rejected')?.length || 0;
    
    // Tamamlanma dərəcəsi
    const completionRate = school.completion_rate || (totalEntries > 0 
      ? Math.round((approvedEntries / totalEntries) * 100) 
      : 0);
    
    return {
      school: {
        id: school.id,
        name: school.name,
        status: school.status,
        completion_rate: completionRate
      },
      region: {
        id: school.regions.id,
        name: school.regions.name
      },
      sector: {
        id: school.sectors.id,
        name: school.sectors.name
      },
      stats: {
        total_categories: categories?.length || 0,
        total_entries: totalEntries,
        approved_entries: approvedEntries,
        pending_entries: pendingEntries,
        rejected_entries: rejectedEntries,
        completion_rate: completionRate
      }
    };
  } catch (error) {
    console.error('Məktəb Admin dashboard yaratma xətası:', error);
    throw error;
  }
}

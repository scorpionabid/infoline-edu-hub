
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';
import { DashboardDataParams, CacheConfig } from '../_shared/types.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Keş parametrələri
const CACHE_ENABLED = true;
const CACHE_TTL = 300; // 5 dəqiqə

serve(async (req) => {
  // CORS işleme
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Token doğrulama
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Yetkiləndirmə token tapılmadı' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Auth client
    const authClient = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false }
      }
    );

    // İstifadəçi yoxlama
    const {
      data: { user: authUser },
      error: userError
    } = await authClient.auth.getUser();

    if (userError || !authUser) {
      return new Response(
        JSON.stringify({ error: 'İstifadəçi doğrulanmadı' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Səlahiyyətli client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    // İstək parametrlərini al
    let params: DashboardDataParams = { role: 'superadmin' };
    
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        params = { 
          role: body.role,
          entityId: body.entityId 
        };
      } catch (e) {
        // Body parse xətası - varsayılanları istifadə et
      }
    }

    // İstifadəçi rolunu əldə et (params.role təyin olunmadığı halda)
    if (!params.role) {
      const { data: userRoleData } = await supabase
        .from('user_roles')
        .select('role, region_id, sector_id, school_id')
        .eq('user_id', authUser.id)
        .single();
      
      if (userRoleData) {
        params.role = userRoleData.role;
        params.entityId = params.entityId || 
                         userRoleData.region_id || 
                         userRoleData.sector_id || 
                         userRoleData.school_id;
      }
    }

    // Keş açarını formalaşdır
    const cacheConfig: CacheConfig = {
      key: `dashboard_data:${params.role}:${params.entityId || 'all'}`,
      ttl: CACHE_TTL,
      dependencies: [
        'regions',
        'sectors',
        'schools',
        'categories',
        'data_entries'
      ]
    };

    // Keşdən yoxla
    if (CACHE_ENABLED) {
      const { data: cachedData } = await supabase
        .from('cache')
        .select('data, created_at')
        .eq('key', cacheConfig.key)
        .single();

      if (cachedData) {
        const cacheAge = (new Date().getTime() - new Date(cachedData.created_at).getTime()) / 1000;
        
        if (cacheAge < cacheConfig.ttl) {
          return new Response(
            JSON.stringify({ data: cachedData.data, fromCache: true }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Dashboard məlumatlarını əldə et
    let dashboardData;
    
    switch (params.role) {
      case 'superadmin':
        dashboardData = await getSuperAdminDashboardData(supabase);
        break;
      case 'regionadmin':
        dashboardData = await getRegionAdminDashboardData(supabase, params.entityId);
        break;
      case 'sectoradmin':
        dashboardData = await getSectorAdminDashboardData(supabase, params.entityId);
        break;
      case 'schooladmin':
        dashboardData = await getSchoolAdminDashboardData(supabase, params.entityId);
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Dəstəklənməyən istifadəçi rolu' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Nəticəni keşə yaz
    if (CACHE_ENABLED) {
      await supabase
        .from('cache')
        .upsert({
          key: cacheConfig.key,
          data: dashboardData,
          ttl: cacheConfig.ttl,
          created_at: new Date().toISOString()
        }, { onConflict: 'key' });
    }

    return new Response(
      JSON.stringify({ data: dashboardData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'İstək işlənərkən xəta baş verdi', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// SuperAdmin dashboard məlumatları
async function getSuperAdminDashboardData(supabase) {
  // Regionlar
  const { data: regions } = await supabase
    .from('regions')
    .select('id, name, status')
    .eq('status', 'active');

  // Sektorlar
  const { data: sectors } = await supabase
    .from('sectors')
    .select('id, name, status, region_id')
    .eq('status', 'active');

  // Məktəblər
  const { data: schools } = await supabase
    .from('schools')
    .select('id, name, status, region_id, sector_id')
    .eq('status', 'active');

  // İstifadəçilər
  const { data: users } = await supabase
    .from('profiles')
    .select('id, role, status');

  // Kateqoriyalar
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, status');

  // Məlumat girişləri statistikası
  const { data: entries } = await supabase
    .from('data_entries')
    .select('id, status');

  // Tamamlanma faizi hesabla
  let completionRate = 0;
  if (entries && entries.length > 0) {
    const approvedEntries = entries.filter(entry => entry.status === 'approved').length;
    completionRate = Math.round((approvedEntries / entries.length) * 100);
  }

  // Təsdiq gözləyən məlumatlar
  const { data: pendingApprovals } = await supabase
    .from('data_entries')
    .select('id, category_id, school_id, status, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5);

  // Region performans məlumatları
  const { data: regionStats } = await supabase.rpc('get_region_completion_stats');

  return {
    stats: {
      regions: regions ? regions.length : 0,
      sectors: sectors ? sectors.length : 0, 
      schools: schools ? schools.length : 0,
      users: users ? users.length : 0,
      completion_rate: completionRate,
      total_entries: entries ? entries.length : 0,
      approved_entries: entries ? entries.filter(entry => entry.status === 'approved').length : 0,
      pending_entries: entries ? entries.filter(entry => entry.status === 'pending').length : 0,
      rejected_entries: entries ? entries.filter(entry => entry.status === 'rejected').length : 0,
      approval_rate: entries && entries.length > 0 
        ? Math.round((entries.filter(entry => entry.status === 'approved').length / entries.length) * 100) 
        : 0
    },
    regions: {
      total: regions ? regions.length : 0,
      active: regions ? regions.filter(r => r.status === 'active').length : 0
    },
    sectors: {
      total: sectors ? sectors.length : 0,
      active: sectors ? sectors.filter(s => s.status === 'active').length : 0
    },
    schools: {
      total: schools ? schools.length : 0,
      active: schools ? schools.filter(s => s.status === 'active').length : 0
    },
    users: {
      total: users ? users.length : 0,
      active: users ? users.filter(u => u.status === 'active').length : 0
    },
    categories: categories || [],
    pendingApprovals: pendingApprovals || [],
    regionPerformance: regionStats || []
  };
}

// Region Admin dashboard məlumatları
async function getRegionAdminDashboardData(supabase, regionId) {
  if (!regionId) {
    return { error: 'Region ID parametri tələb olunur' };
  }

  // Region məlumatları
  const { data: region } = await supabase
    .from('regions')
    .select('id, name, status')
    .eq('id', regionId)
    .single();

  // Sektorlar
  const { data: sectors } = await supabase
    .from('sectors')
    .select('id, name, status')
    .eq('region_id', regionId);

  // Məktəblər
  const { data: schools } = await supabase
    .from('schools')
    .select('id, name, status, sector_id')
    .eq('region_id', regionId);

  // Məlumat girişləri
  const { data: entries } = await supabase
    .from('data_entries')
    .select('id, status, school_id')
    .in('school_id', schools ? schools.map(s => s.id) : []);

  // Tamamlanma faizi
  let completionRate = 0;
  if (entries && entries.length > 0) {
    const approvedEntries = entries.filter(entry => entry.status === 'approved').length;
    completionRate = Math.round((approvedEntries / entries.length) * 100);
  }

  // Sektor statistikaları
  const sectorStats = await supabase.rpc('get_sector_stats_by_region', { region_id: regionId });

  return {
    region: region || { name: 'N/A', status: 'N/A' },
    sectors: {
      total: sectors ? sectors.length : 0,
      active: sectors ? sectors.filter(s => s.status === 'active').length : 0
    },
    schools: {
      total: schools ? schools.length : 0,
      active: schools ? schools.filter(s => s.status === 'active').length : 0
    },
    stats: {
      completion_rate: completionRate,
      total_entries: entries ? entries.length : 0,
      pending_count: entries ? entries.filter(e => e.status === 'pending').length : 0,
      pending_schools: countUniqueSchools(entries ? entries.filter(e => e.status === 'pending') : [])
    },
    sectorStats: sectorStats.data || []
  };
}

// Sektor Admin dashboard məlumatları
async function getSectorAdminDashboardData(supabase, sectorId) {
  if (!sectorId) {
    return { error: 'Sektor ID parametri tələb olunur' };
  }

  // Sektor məlumatları
  const { data: sector } = await supabase
    .from('sectors')
    .select('id, name, status, region_id')
    .eq('id', sectorId)
    .single();

  // Region məlumatları
  let region = null;
  if (sector && sector.region_id) {
    const { data: regionData } = await supabase
      .from('regions')
      .select('id, name')
      .eq('id', sector.region_id)
      .single();
    
    region = regionData;
  }

  // Məktəblər
  const { data: schools } = await supabase
    .from('schools')
    .select('id, name, status')
    .eq('sector_id', sectorId);

  // Məlumat girişləri
  const { data: entries } = await supabase
    .from('data_entries')
    .select('id, status, school_id')
    .in('school_id', schools ? schools.map(s => s.id) : []);

  // Tamamlanma faizi
  let completionRate = 0;
  if (entries && entries.length > 0) {
    const approvedEntries = entries.filter(entry => entry.status === 'approved').length;
    completionRate = Math.round((approvedEntries / entries.length) * 100);
  }

  // Məktəb statistikaları
  const schoolStats = await supabase.rpc('get_school_stats_by_sector', { sector_id: sectorId });

  return {
    sector: sector || { name: 'N/A', status: 'N/A' },
    region: region || { name: 'N/A' },
    schools: {
      total: schools ? schools.length : 0,
      active: schools ? schools.filter(s => s.status === 'active').length : 0
    },
    stats: {
      completion_rate: completionRate,
      total_entries: entries ? entries.length : 0,
      pending_count: entries ? entries.filter(e => e.status === 'pending').length : 0,
      pending_schools: countUniqueSchools(entries ? entries.filter(e => e.status === 'pending') : [])
    },
    schoolStats: schoolStats.data || []
  };
}

// Məktəb Admin dashboard məlumatları
async function getSchoolAdminDashboardData(supabase, schoolId) {
  if (!schoolId) {
    return { error: 'Məktəb ID parametri tələb olunur' };
  }

  // Məktəb məlumatları
  const { data: school } = await supabase
    .from('schools')
    .select('id, name, status, region_id, sector_id')
    .eq('id', schoolId)
    .single();

  // Kateqoriyalar
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, status')
    .eq('status', 'active');

  // Sütunlar
  const { data: columns } = await supabase
    .from('columns')
    .select('id, category_id');

  // Məlumat girişləri
  const { data: entries } = await supabase
    .from('data_entries')
    .select('id, status, category_id, column_id')
    .eq('school_id', schoolId);

  // Tamamlanma və status statistikası
  let completion = { total: 0, completed: 0, percentage: 0 };
  let status = { pending: 0, approved: 0, rejected: 0, total: 0 };
  let forms = { pending: 0, approved: 0, rejected: 0, dueSoon: 0, overdue: 0, total: 0 };

  if (columns && columns.length > 0) {
    completion.total = columns.length;
    
    if (entries && entries.length > 0) {
      completion.completed = entries.length;
      completion.percentage = Math.round((entries.length / columns.length) * 100);
      
      status.pending = entries.filter(e => e.status === 'pending').length;
      status.approved = entries.filter(e => e.status === 'approved').length;
      status.rejected = entries.filter(e => e.status === 'rejected').length;
      status.total = entries.length;
    }
  }

  // Kateqoriyaların tamamlanma faizlərini hesablayaq
  let categoryStats = [];
  if (categories && categories.length > 0 && columns && entries) {
    categoryStats = categories.map(category => {
      const categoryColumns = columns.filter(col => col.category_id === category.id);
      const categoryEntries = entries.filter(entry => entry.category_id === category.id);
      
      let completionRate = 0;
      if (categoryColumns.length > 0) {
        completionRate = Math.round((categoryEntries.length / categoryColumns.length) * 100);
      }
      
      return {
        id: category.id,
        name: category.name,
        completionRate,
        completion: {
          total: categoryColumns.length,
          completed: categoryEntries.length,
          percentage: completionRate
        }
      };
    });
  }

  // Bildirisler
  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, title, message, created_at, is_read')
    .eq('user_id', schoolId)  // Fərz edək ki, məktəb ID istifadəçi ID kimi istifadə edilir
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    completion,
    status,
    forms,
    categories: categoryStats,
    notifications: notifications || [],
    completionRate: completion.percentage,
    upcoming: [], // TODO: Planlanan tarihler eklenebilir
    pendingForms: []  // TODO: Formlar eklenebilir
  };
}

// Unikal məktəb sayını hesabla
function countUniqueSchools(entries) {
  if (!entries || entries.length === 0) return 0;
  
  const uniqueSchoolIds = new Set();
  entries.forEach(entry => {
    if (entry.school_id) {
      uniqueSchoolIds.add(entry.school_id);
    }
  });
  
  return uniqueSchoolIds.size;
}

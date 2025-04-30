
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

interface DashboardDataParams {
  role: "superadmin" | "regionadmin" | "sectoradmin" | "schooladmin";
  entityId?: string;
  filters?: Record<string, any>;
}

interface CacheConfig {
  key: string;
  ttl: number; // saniyələrlə
  dependencies?: string[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Not authorized', details: authError }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Parametreleri al
    const { role, entityId, filters } = await req.json() as DashboardDataParams

    // Kullanıcının yetki kontrolü 
    const { data: userRole, error: userRoleError } = await supabaseClient.rpc('get_user_role', {
      user_id: user.id
    })

    if (userRoleError) {
      return new Response(JSON.stringify({ error: 'Error checking user role', details: userRoleError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Kullanıcının belirtilen rolüne göre erişim kontrolü
    if (role !== userRole) {
      let hasAccess = false;
      
      // Süper admin her şeye erişebilir
      if (userRole === 'superadmin') {
        hasAccess = true;
      }
      // Bölge admini kendi bölgesindeki sektör ve okullara erişebilir
      else if (userRole === 'regionadmin' && (role === 'sectoradmin' || role === 'schooladmin')) {
        // Kullanıcının bölgesini al
        const { data: userData, error: userDataError } = await supabaseClient
          .from('user_roles')
          .select('region_id')
          .eq('user_id', user.id)
          .single();
        
        if (userDataError) {
          return new Response(JSON.stringify({ error: 'Error checking user data', details: userDataError }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // Eğer sektör admin dashboard'ı isteniyorsa, sektörün bölgesini kontrol et
        if (role === 'sectoradmin' && entityId) {
          const { data: sector, error: sectorError } = await supabaseClient
            .from('sectors')
            .select('region_id')
            .eq('id', entityId)
            .single();
          
          if (!sectorError && sector && sector.region_id === userData.region_id) {
            hasAccess = true;
          }
        }
        // Eğer okul admin dashboard'ı isteniyorsa, okulun bölgesini kontrol et
        else if (role === 'schooladmin' && entityId) {
          const { data: school, error: schoolError } = await supabaseClient
            .from('schools')
            .select('region_id')
            .eq('id', entityId)
            .single();
          
          if (!schoolError && school && school.region_id === userData.region_id) {
            hasAccess = true;
          }
        }
      }
      // Sektör admini kendi sektöründeki okullara erişebilir
      else if (userRole === 'sectoradmin' && role === 'schooladmin') {
        // Kullanıcının sektörünü al
        const { data: userData, error: userDataError } = await supabaseClient
          .from('user_roles')
          .select('sector_id')
          .eq('user_id', user.id)
          .single();
        
        if (userDataError) {
          return new Response(JSON.stringify({ error: 'Error checking user data', details: userDataError }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // Okulun sektörünü kontrol et
        if (entityId) {
          const { data: school, error: schoolError } = await supabaseClient
            .from('schools')
            .select('sector_id')
            .eq('id', entityId)
            .single();
          
          if (!schoolError && school && school.sector_id === userData.sector_id) {
            hasAccess = true;
          }
        }
      }
      
      if (!hasAccess) {
        return new Response(JSON.stringify({ error: 'Not authorized to access this dashboard' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Önbellek yapılandırması
    const cacheConfig: CacheConfig = {
      key: `dashboard_${role}_${entityId || 'all'}_${JSON.stringify(filters || {})}`,
      ttl: 300, // 5 dakika
      dependencies: [
        `user:${user.id}`, 
        role === 'superadmin' ? 'global' : role === 'regionadmin' ? `region:${entityId}` : role === 'sectoradmin' ? `sector:${entityId}` : `school:${entityId}`
      ]
    };

    // Önbellekten kontrol et
    let cachedData;
    try {
      const { data: cacheData } = await supabaseClient
        .from('cache')
        .select('data, created_at')
        .eq('key', cacheConfig.key)
        .single();
      
      if (cacheData) {
        const cacheAge = new Date().getTime() - new Date(cacheData.created_at).getTime();
        if (cacheAge < cacheConfig.ttl * 1000) {
          cachedData = cacheData.data;
        }
      }
    } catch (error) {
      console.log('Cache check error:', error);
      // Cache hatalarını yok sayabiliriz
    }

    // Eğer önbellekte varsa, hemen döndür
    if (cachedData) {
      return new Response(JSON.stringify({ success: true, data: cachedData, fromCache: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Role göre dashboard verilerini getir
    let dashboardData;
    switch (role) {
      case 'superadmin':
        dashboardData = await getSuperAdminDashboard(supabaseClient, filters);
        break;
      case 'regionadmin':
        dashboardData = await getRegionAdminDashboard(supabaseClient, entityId, filters);
        break;
      case 'sectoradmin':
        dashboardData = await getSectorAdminDashboard(supabaseClient, entityId, filters);
        break;
      case 'schooladmin':
        dashboardData = await getSchoolAdminDashboard(supabaseClient, entityId, filters);
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid role specified' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // Sonuçları önbelleğe al
    try {
      await supabaseClient
        .from('cache')
        .upsert({
          key: cacheConfig.key,
          data: dashboardData,
          created_at: new Date().toISOString(),
          ttl: cacheConfig.ttl,
          dependencies: cacheConfig.dependencies
        }, { onConflict: 'key' });
    } catch (error) {
      console.log('Cache save error:', error);
      // Cache hatalarını yok sayabiliriz
    }

    return new Response(JSON.stringify({ success: true, data: dashboardData }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error getting dashboard data:', error)
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function getSuperAdminDashboard(supabase, filters) {
  // Temel istatistikler
  const [
    regionsCount,
    sectorsCount,
    schoolsCount,
    usersCount,
    categoriesCount,
    columnsCount
  ] = await Promise.all([
    getCount(supabase, 'regions', filters?.region),
    getCount(supabase, 'sectors', filters?.sector),
    getCount(supabase, 'schools', filters?.school),
    getUsersCount(supabase, filters?.user),
    getCount(supabase, 'categories', filters?.category),
    getCount(supabase, 'columns', filters?.column)
  ]);

  // Tamamlanma oranları
  const completionStats = await getCompletionStats(supabase);

  // Son aktiviteler
  const recentActivities = await getRecentActivities(supabase, 10);

  // Kategori bazlı istatistikler
  const categoryStats = await getCategoryStats(supabase);

  return {
    counts: {
      regions: regionsCount,
      sectors: sectorsCount,
      schools: schoolsCount,
      users: usersCount,
      categories: categoriesCount,
      columns: columnsCount
    },
    completion: completionStats,
    recentActivities,
    categoryStats,
    lastUpdated: new Date().toISOString()
  };
}

async function getRegionAdminDashboard(supabase, regionId, filters) {
  if (!regionId) {
    throw new Error('Region ID is required');
  }

  // Bölge bilgileri
  const { data: region, error: regionError } = await supabase
    .from('regions')
    .select('*')
    .eq('id', regionId)
    .single();

  if (regionError) {
    throw new Error(`Error fetching region: ${regionError.message}`);
  }

  // Bölgeye ait sektör ve okul sayıları
  const [
    sectorsCount,
    schoolsCount,
    sectorAdminsCount,
    schoolAdminsCount
  ] = await Promise.all([
    getCount(supabase, 'sectors', { ...filters?.sector, region_id: regionId }),
    getCount(supabase, 'schools', { ...filters?.school, region_id: regionId }),
    getUsersCount(supabase, { ...filters?.user, role: 'sectoradmin', region_id: regionId }),
    getUsersCount(supabase, { ...filters?.user, role: 'schooladmin', region_id: regionId })
  ]);

  // Bölgeye ait okulların tamamlanma oranları
  const completionStats = await getCompletionStats(supabase, { region_id: regionId });

  // Sektör bazlı istatistikler
  const sectorStats = await getSectorStats(supabase, regionId);

  // Son aktiviteler
  const recentActivities = await getRecentActivities(supabase, 10, { region_id: regionId });

  return {
    region,
    counts: {
      sectors: sectorsCount,
      schools: schoolsCount,
      sectorAdmins: sectorAdminsCount,
      schoolAdmins: schoolAdminsCount
    },
    completion: completionStats,
    sectorStats,
    recentActivities,
    lastUpdated: new Date().toISOString()
  };
}

async function getSectorAdminDashboard(supabase, sectorId, filters) {
  if (!sectorId) {
    throw new Error('Sector ID is required');
  }

  // Sektör bilgileri
  const { data: sector, error: sectorError } = await supabase
    .from('sectors')
    .select('*, regions(*)')
    .eq('id', sectorId)
    .single();

  if (sectorError) {
    throw new Error(`Error fetching sector: ${sectorError.message}`);
  }

  // Sektöre ait okul sayısı ve admin sayısı
  const [
    schoolsCount,
    schoolAdminsCount
  ] = await Promise.all([
    getCount(supabase, 'schools', { ...filters?.school, sector_id: sectorId }),
    getUsersCount(supabase, { ...filters?.user, role: 'schooladmin', sector_id: sectorId })
  ]);

  // Sektöre ait okulların tamamlanma oranları
  const completionStats = await getCompletionStats(supabase, { sector_id: sectorId });

  // Okul bazlı istatistikler
  const schoolStats = await getSchoolStats(supabase, sectorId);

  // Son aktiviteler
  const recentActivities = await getRecentActivities(supabase, 10, { sector_id: sectorId });

  return {
    sector,
    counts: {
      schools: schoolsCount,
      schoolAdmins: schoolAdminsCount
    },
    completion: completionStats,
    schoolStats,
    recentActivities,
    lastUpdated: new Date().toISOString()
  };
}

async function getSchoolAdminDashboard(supabase, schoolId, filters) {
  if (!schoolId) {
    throw new Error('School ID is required');
  }

  // Okul bilgileri
  const { data: school, error: schoolError } = await supabase
    .from('schools')
    .select('*, sectors(*), regions(*)')
    .eq('id', schoolId)
    .single();

  if (schoolError) {
    throw new Error(`Error fetching school: ${schoolError.message}`);
  }

  // Kategoriler ve tamamlanma durumları
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .eq('status', 'active');

  if (categoriesError) {
    throw new Error(`Error fetching categories: ${categoriesError.message}`);
  }

  // Her kategori için tamamlanma durumu
  const categoryCompletionPromises = categories.map(async (category) => {
    // Kategoriye ait sütunları al
    const { data: columns, error: columnsError } = await supabase
      .from('columns')
      .select('id')
      .eq('category_id', category.id)
      .eq('status', 'active');

    if (columnsError) {
      console.error(`Error fetching columns for category ${category.id}:`, columnsError);
      return {
        ...category,
        columnsCount: 0,
        filledColumnsCount: 0,
        completionPercentage: 0
      };
    }

    // Bu kategori için doldurulmuş sütunları say
    const { data: entries, error: entriesError } = await supabase
      .from('data_entries')
      .select('column_id')
      .eq('school_id', schoolId)
      .eq('category_id', category.id)
      .in('status', ['approved', 'pending']);

    if (entriesError) {
      console.error(`Error fetching entries for category ${category.id}:`, entriesError);
      return {
        ...category,
        columnsCount: columns.length,
        filledColumnsCount: 0,
        completionPercentage: 0
      };
    }

    // Benzersiz doldurulmuş sütunları say
    const uniqueFilledColumns = new Set(entries.map(e => e.column_id)).size;
    const completionPercentage = columns.length > 0 
      ? Math.round((uniqueFilledColumns / columns.length) * 100)
      : 100;

    return {
      ...category,
      columnsCount: columns.length,
      filledColumnsCount: uniqueFilledColumns,
      completionPercentage
    };
  });

  const categoryCompletionStats = await Promise.all(categoryCompletionPromises);

  // Son aktiviteler
  const recentActivities = await getRecentActivities(supabase, 10, { school_id: schoolId });

  // Son teslim tarihleri yaklaşan kategoriler
  const upcomingDeadlines = categories
    .filter(cat => cat.deadline && new Date(cat.deadline) > new Date())
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  return {
    school,
    categoryStats: categoryCompletionStats,
    recentActivities,
    upcomingDeadlines,
    lastUpdated: new Date().toISOString()
  };
}

// Yardımcı fonksiyonlar
async function getCount(supabase, table, filters = {}) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });

  // Filtreler varsa ekle
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });

  const { count, error } = await query;

  if (error) {
    console.error(`Error getting count for ${table}:`, error);
    return 0;
  }

  return count || 0;
}

async function getUsersCount(supabase, filters = {}) {
  let query = supabase.from('user_roles').select('*', { count: 'exact', head: true });

  // Filtreler varsa ekle
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });

  const { count, error } = await query;

  if (error) {
    console.error('Error getting users count:', error);
    return 0;
  }

  return count || 0;
}

async function getCompletionStats(supabase, filters = {}) {
  // Okulların tamamlanma oranlarını al
  let query = supabase
    .from('schools')
    .select('id, name, completion_rate')
    .order('completion_rate', { ascending: false });

  // Filtreler varsa ekle
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });

  const { data: schools, error } = await query;

  if (error) {
    console.error('Error getting completion stats:', error);
    return {
      average: 0,
      schoolsDistribution: [],
      topSchools: [],
      bottomSchools: []
    };
  }

  // Ortalama tamamlanma oranı
  const average = schools.length > 0
    ? schools.reduce((sum, school) => sum + (school.completion_rate || 0), 0) / schools.length
    : 0;

  // Tamamlanma oranı dağılımı
  const distribution = {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0
  };

  schools.forEach(school => {
    const rate = school.completion_rate || 0;
    if (rate <= 20) distribution['0-20']++;
    else if (rate <= 40) distribution['21-40']++;
    else if (rate <= 60) distribution['41-60']++;
    else if (rate <= 80) distribution['61-80']++;
    else distribution['81-100']++;
  });

  return {
    average: Math.round(average),
    schoolsDistribution: Object.entries(distribution).map(([range, count]) => ({ range, count })),
    topSchools: schools.slice(0, 5),
    bottomSchools: [...schools].sort((a, b) => (a.completion_rate || 0) - (b.completion_rate || 0)).slice(0, 5)
  };
}

async function getRecentActivities(supabase, limit = 5, filters = {}) {
  let query = supabase
    .from('audit_logs')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(limit);

  // Filtreler varsa ekle
  if (filters.region_id) {
    // Bölgeye ait entitylerin loglarını bul
    const { data: regionEntities } = await supabase
      .from('schools')
      .select('id')
      .eq('region_id', filters.region_id);
    
    const regionEntityIds = regionEntities?.map(e => e.id) || [];
    query = query.in('entity_id', [...regionEntityIds, filters.region_id]);
  }

  if (filters.sector_id) {
    // Sektöre ait okulların loglarını bul
    const { data: sectorEntities } = await supabase
      .from('schools')
      .select('id')
      .eq('sector_id', filters.sector_id);
    
    const sectorEntityIds = sectorEntities?.map(e => e.id) || [];
    query = query.in('entity_id', [...sectorEntityIds, filters.sector_id]);
  }

  if (filters.school_id) {
    query = query.eq('entity_id', filters.school_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error getting recent activities:', error);
    return [];
  }

  return data.map(activity => ({
    id: activity.id,
    action: activity.action,
    entityType: activity.entity_type,
    userName: activity.profiles?.full_name || 'Unknown User',
    createdAt: activity.created_at
  }));
}

async function getCategoryStats(supabase) {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, status');

  if (error) {
    console.error('Error getting categories:', error);
    return [];
  }

  const statsPromises = categories.map(async (category) => {
    // Bu kategori için toplam ve doldurulmuş sütun sayılarını al
    const [totalColumns, totalEntries] = await Promise.all([
      getCount(supabase, 'columns', { category_id: category.id }),
      getCount(supabase, 'data_entries', { category_id: category.id })
    ]);

    // Unique okul sayısı
    const { data: uniqueSchools, error: schoolsError } = await supabase
      .from('data_entries')
      .select('school_id', { count: 'exact', head: true })
      .eq('category_id', category.id);

    const uniqueSchoolsCount = uniqueSchools?.length || 0;

    return {
      ...category,
      totalColumns,
      totalEntries,
      uniqueSchoolsCount
    };
  });

  return Promise.all(statsPromises);
}

async function getSectorStats(supabase, regionId) {
  const { data: sectors, error } = await supabase
    .from('sectors')
    .select('id, name')
    .eq('region_id', regionId);

  if (error) {
    console.error('Error getting sectors:', error);
    return [];
  }

  const statsPromises = sectors.map(async (sector) => {
    // Bu sektöre ait okul sayısı
    const schoolsCount = await getCount(supabase, 'schools', { sector_id: sector.id });
    
    // Bu sektöre ait okulların ortalama tamamlanma oranı
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('completion_rate')
      .eq('sector_id', sector.id);
    
    const averageCompletion = schools && schools.length > 0
      ? Math.round(schools.reduce((sum, school) => sum + (school.completion_rate || 0), 0) / schools.length)
      : 0;

    return {
      ...sector,
      schoolsCount,
      averageCompletion
    };
  });

  return Promise.all(statsPromises);
}

async function getSchoolStats(supabase, sectorId) {
  const { data: schools, error } = await supabase
    .from('schools')
    .select('id, name, completion_rate')
    .eq('sector_id', sectorId)
    .order('completion_rate', { ascending: false });

  if (error) {
    console.error('Error getting schools:', error);
    return [];
  }

  return schools;
}

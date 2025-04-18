
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  // CORS üçün OPTIONS sorğusunu emal edirik
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  
  try {
    // Supabase klienti yaradırıq
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );
    
    // İstifadəçi məlumatlarını alırıq
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'İstifadəçi təsdiqlənmədi' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }
    
    // İstifadəçinin rolunu yoxlayırıq
    const { data: userRole, error: roleError } = await supabaseClient.rpc('get_user_role_safe');
    
    if (roleError) {
      return new Response(
        JSON.stringify({ success: false, error: 'İstifadəçi rolu alınarkən xəta: ' + roleError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Yalnız sektor admini bu funksiyanı çağıra bilər
    if (userRole !== 'sectoradmin') {
      return new Response(
        JSON.stringify({ success: false, error: 'Bu əməliyyat üçün icazəniz yoxdur' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403 
        }
      );
    }
    
    // İstifadəçinin sektor ID-sini alırıq
    const { data: sectorId, error: sectorIdError } = await supabaseClient.rpc('get_user_sector_id');
    
    if (sectorIdError) {
      return new Response(
        JSON.stringify({ success: false, error: 'İstifadəçi sektor ID alınarkən xəta: ' + sectorIdError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Sektora aid məktəbləri alırıq
    const { data: schools, error: schoolsError } = await supabaseClient
      .from('schools')
      .select('id, name, address, phone, email, status')
      .eq('sector_id', sectorId)
      .is('archived', false);
      
    if (schoolsError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Məktəb məlumatları alınarkən xəta: ' + schoolsError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Aktiv kateqoriyaları alırıq
    const { data: categories, error: categoriesError } = await supabaseClient
      .from('categories')
      .select('id, name')
      .eq('status', 'active')
      .is('archived', false);
      
    if (categoriesError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Kateqoriya məlumatları alınarkən xəta: ' + categoriesError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Təsdiq gözləyən məlumatları alırıq
    const { data: pendingEntries, error: pendingError } = await supabaseClient
      .from('data_entries')
      .select(`
        id, 
        school_id,
        category_id,
        status,
        created_at,
        schools(name),
        categories(name)
      `)
      .eq('status', 'pending')
      .in('school_id', schools.map(school => school.id));
      
    if (pendingError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Təsdiq gözləyən məlumatlar alınarkən xəta: ' + pendingError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Məktəblərin tamamlanma dərəcəsini hesablayırıq
    const schoolsWithCompletionRate = await Promise.all(schools.map(async (school) => {
      const { data: entries, error: entriesError } = await supabaseClient
        .from('data_entries')
        .select('id, status, category_id')
        .eq('school_id', school.id);
        
      if (entriesError) {
        console.error(`Məktəb ${school.id} üçün məlumatlar alınarkən xəta:`, entriesError);
        return {
          ...school,
          completionRate: 0
        };
      }
      
      // Tamamlanmış kateqoriyaların sayını hesablayırıq
      const completedCategories = new Set();
      entries.forEach(entry => {
        if (entry.status === 'approved') {
          completedCategories.add(entry.category_id);
        }
      });
      
      const completionRate = categories.length > 0 
        ? (completedCategories.size / categories.length) * 100 
        : 0;
      
      return {
        ...school,
        completionRate: Math.round(completionRate)
      };
    }));
    
    // Təsdiq gözləyən məlumatları formatlaşdırırıq
    const pendingApprovals = pendingEntries.map(entry => ({
      id: entry.id,
      schoolId: entry.school_id,
      schoolName: entry.schools?.name || 'Naməlum məktəb',
      categoryId: entry.category_id,
      categoryName: entry.categories?.name || 'Naməlum kateqoriya',
      submittedAt: entry.created_at,
      status: entry.status
    }));
    
    // Məktəblərin statuslarını hesablayırıq
    let completedSchools = 0;
    let pendingSchools = 0;
    let notStartedSchools = 0;
    
    schoolsWithCompletionRate.forEach(school => {
      if (school.completionRate === 100) {
        completedSchools++;
      } else if (school.completionRate > 0) {
        pendingSchools++;
      } else {
        notStartedSchools++;
      }
    });
    
    return new Response(
      JSON.stringify({
        schools: schoolsWithCompletionRate,
        pendingApprovals,
        totalSchools: schools.length,
        completedSchools,
        pendingSchools,
        notStartedSchools
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error("Serverdə xəta:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
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
    console.log("Edge Function çağırıldı");
    
    // Authorization header-i yoxlayırıq
    const authHeader = req.headers.get('Authorization');
    console.log("Authorization header:", authHeader ? "Mövcuddur" : "Yoxdur");
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization header yoxdur' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }
    
    // Supabase klienti yaradırıq
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );
    
    console.log("Supabase klienti yaradıldı");
    
    // İstifadəçi məlumatlarını alırıq
    try {
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      console.log("İstifadəçi məlumatları:", user ? "Alındı" : "Alınmadı");
      console.log("İstifadəçi xətası:", userError ? userError.message : "Yoxdur");
      
      if (userError || !user) {
        return new Response(
          JSON.stringify({ success: false, error: 'İstifadəçi təsdiqlənmədi: ' + (userError?.message || 'Naməlum xəta') }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401 
          }
        );
      }
    } catch (authError) {
      console.error("Auth xətası:", authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Auth xətası: ' + authError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // İstifadəçinin rolunu yoxlayırıq
    try {
      console.log("İstifadəçi rolunu alırıq...");
      const { data: userRole, error: roleError } = await supabaseClient.rpc('get_user_role_safe');
      
      console.log("İstifadəçi rolu:", userRole);
      console.log("Rol xətası:", roleError ? roleError.message : "Yoxdur");
      
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
          JSON.stringify({ success: false, error: 'Bu əməliyyat üçün icazəniz yoxdur. Rol: ' + userRole }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403 
          }
        );
      }
    } catch (roleError) {
      console.error("Rol xətası:", roleError);
      return new Response(
        JSON.stringify({ success: false, error: 'Rol xətası: ' + roleError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // İstifadəçinin sektor ID-sini alırıq
    try {
      console.log("Sektor ID alınır...");
      const { data: sectorId, error: sectorIdError } = await supabaseClient.rpc('get_user_sector_id');
      
      console.log("Sektor ID:", sectorId);
      console.log("Sektor ID xətası:", sectorIdError ? sectorIdError.message : "Yoxdur");
      
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
      console.log("Məktəblər alınır...");
      const { data: schools, error: schoolsError } = await supabaseClient
        .from('schools')
        .select('id, name, address, phone, email, status')
        .eq('sector_id', sectorId);
        
      console.log("Məktəblər:", schools ? `${schools.length} məktəb tapıldı` : "Tapılmadı");
      console.log("Məktəb xətası:", schoolsError ? schoolsError.message : "Yoxdur");
      
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
      console.log("Kateqoriyalar alınır...");
      const { data: categories, error: categoriesError } = await supabaseClient
        .from('categories')
        .select('id, name')
        .eq('status', 'active')
        .is('archived', false);
        
      console.log("Kateqoriyalar:", categories ? `${categories.length} kateqoriya tapıldı` : "Tapılmadı");
      console.log("Kateqoriya xətası:", categoriesError ? categoriesError.message : "Yoxdur");
      
      if (categoriesError) {
        return new Response(
          JSON.stringify({ success: false, error: 'Kateqoriya məlumatları alınarkən xəta: ' + categoriesError.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
      
      // data_entries cədvəlinin mövcudluğunu yoxlayırıq
      try {
        console.log("data_entries cədvəlinin mövcudluğu yoxlanılır...");
        const { data: tableExists, error: tableError } = await supabaseClient
          .from('data_entries')
          .select('id')
          .limit(1);
          
        console.log("data_entries cədvəli:", tableExists !== null ? "Mövcuddur" : "Mövcud deyil");
        console.log("Cədvəl xətası:", tableError ? tableError.message : "Yoxdur");
        
        if (tableError) {
          return new Response(
            JSON.stringify({ success: false, error: 'data_entries cədvəli yoxlanılarkən xəta: ' + tableError.message }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500 
            }
          );
        }
      } catch (tableError) {
        console.error("Cədvəl xətası:", tableError);
        return new Response(
          JSON.stringify({ success: false, error: 'data_entries cədvəli yoxlanılarkən xəta: ' + tableError.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
      
      // Təsdiq gözləyən məlumatları alırıq
      console.log("Təsdiq gözləyən məlumatlar alınır...");
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
        
      console.log("Təsdiq gözləyən məlumatlar:", pendingEntries ? `${pendingEntries.length} məlumat tapıldı` : "Tapılmadı");
      console.log("Təsdiq xətası:", pendingError ? pendingError.message : "Yoxdur");
      
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
      console.log("Məktəblərin tamamlanma dərəcəsi hesablanır...");
      const schoolsWithCompletionRate = [];
      
      for (const school of schools) {
        try {
          const { data: entries, error: entriesError } = await supabaseClient
            .from('data_entries')
            .select('id, status, category_id')
            .eq('school_id', school.id);
            
          if (entriesError) {
            console.error(`Məktəb ${school.id} üçün məlumatlar alınarkən xəta:`, entriesError);
            schoolsWithCompletionRate.push({
              ...school,
              completionRate: 0
            });
            continue;
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
          
          schoolsWithCompletionRate.push({
            ...school,
            completionRate: Math.round(completionRate)
          });
        } catch (schoolError) {
          console.error(`Məktəb ${school.id} üçün xəta:`, schoolError);
          schoolsWithCompletionRate.push({
            ...school,
            completionRate: 0
          });
        }
      }
      
      console.log("Məktəblərin tamamlanma dərəcəsi hesablandı");
      
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
      
      console.log("Nəticələr hazırlanır...");
      
      // Nəticəni qaytarırıq
      return new Response(
        JSON.stringify({
          schools: schoolsWithCompletionRate,
          pendingApprovals,
          totalSchools: schoolsWithCompletionRate.length,
          completedSchools,
          pendingSchools,
          notStartedSchools
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (sectorError) {
      console.error("Sektor xətası:", sectorError);
      return new Response(
        JSON.stringify({ success: false, error: 'Sektor xətası: ' + sectorError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
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
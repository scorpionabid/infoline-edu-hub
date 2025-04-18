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
    
    // Sorğu parametrlərini alırıq
    const { schoolId, categoryId } = await req.json();
    
    if (!schoolId || !categoryId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Məktəb ID və ya Kateqoriya ID təqdim edilməyib' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
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
    
    // Məktəb və kateqoriya məlumatlarını alırıq
    const { data: school, error: schoolError } = await supabaseClient
      .from('schools')
      .select('id, name, sector_id, region_id')
      .eq('id', schoolId)
      .single();
      
    if (schoolError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Məktəb məlumatları alınarkən xəta: ' + schoolError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Sektor admini üçün icazəni yoxlayırıq
    if (userRole === 'sectoradmin') {
      // İstifadəçinin sektor ID-sini alırıq
      const { data: userSectorId, error: sectorError } = await supabaseClient.rpc('get_user_sector_id');
      
      if (sectorError) {
        return new Response(
          JSON.stringify({ success: false, error: 'İstifadəçi sektor ID alınarkən xəta: ' + sectorError.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
      
      // İstifadəçinin məktəbin aid olduğu sektora icazəsi olub-olmadığını yoxlayırıq
      if (userSectorId !== school.sector_id) {
        return new Response(
          JSON.stringify({ success: false, error: 'Bu məktəb üzərində əməliyyat aparmaq üçün icazəniz yoxdur' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403 
          }
        );
      }
    }
    
    // Kateqoriya məlumatlarını alırıq
    const { data: category, error: categoryError } = await supabaseClient
      .from('categories')
      .select('id, name')
      .eq('id', categoryId)
      .single();
      
    if (categoryError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Kateqoriya məlumatları alınarkən xəta: ' + categoryError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Kateqoriyanın sütunlarını alırıq
    const { data: columns, error: columnsError } = await supabaseClient
      .from('columns')
      .select('id, name, type, options, validation_rules')
      .eq('category_id', categoryId)
      .order('display_order');
      
    if (columnsError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Sütun məlumatları alınarkən xəta: ' + columnsError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Məlumatları alırıq
    const { data: entries, error: entriesError } = await supabaseClient
      .from('data_entries')
      .select('id, column_id, value, status, created_at, updated_at')
      .eq('school_id', schoolId)
      .eq('category_id', categoryId);
      
    if (entriesError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Məlumatlar alınarkən xəta: ' + entriesError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    // Məlumatları formatlaşdırırıq
    const formattedEntries = columns.map(column => {
      const entry = entries.find(e => e.column_id === column.id);
      
      return {
        columnId: column.id,
        columnName: column.name,
        columnType: column.type,
        options: column.options,
        validationRules: column.validation_rules,
        value: entry ? entry.value : null,
        entryId: entry ? entry.id : null,
        status: entry ? entry.status : null,
        createdAt: entry ? entry.created_at : null,
        updatedAt: entry ? entry.updated_at : null
      };
    });
    
    return new Response(
      JSON.stringify({
        school,
        category,
        entries: formattedEntries
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
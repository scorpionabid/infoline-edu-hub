
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

    // Request body-ni alaq
    let body;
    try {
      body = await req.json();
      console.log('Request məlumatları:', body);
    } catch (error) {
      console.error('Request body parse xətası:', error);
      return new Response(
        JSON.stringify({ error: 'Düzgün JSON formatında body tələb olunur' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Parametrləri yoxlayaq
    const { action, entityType, data, id } = body;
    
    if (!action || !entityType) {
      console.error('Tələb olunan parametrlər çatışmır');
      return new Response(
        JSON.stringify({ error: 'Əməliyyat (action) və entity növü (entityType) tələb olunur' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const validActions = ['create', 'read', 'update', 'delete'];
    if (!validActions.includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Düzgün olmayan əməliyyat. Qəbul edilən əməliyyatlar: ' + validActions.join(', ') }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const validEntityTypes = ['column', 'region', 'sector', 'school', 'category'];
    if (!validEntityTypes.includes(entityType)) {
      return new Response(
        JSON.stringify({ error: 'Düzgün olmayan entity növü. Qəbul edilən növlər: ' + validEntityTypes.join(', ') }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Entity növünə görə cədvəl adını təyin edirik
    // 'columns' cədvəli saxladıq, çünki 'column' artıq SQL-də xüsusi sözlə qarışıq sala bilər
    const tableMap = {
      'column': 'columns',
      'region': 'regions',
      'sector': 'sectors',
      'school': 'schools',
      'category': 'categories'
    };
    
    const table = tableMap[entityType];
    
    let result;
    
    // Əməliyyat növünə görə müvafiq sorğunu yerinə yetiririk
    switch (action) {
      case 'create':
        if (!data) {
          return new Response(
            JSON.stringify({ error: 'Yaratmaq üçün data tələb olunur' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        // "data"nı genişləndiririk, yaradılma və yenilənmə zamanını əlavə edirik
        const createData = { 
          ...data, 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        };
        
        const { data: createdItem, error: createError } = await supabase
          .from(table)
          .insert(createData)
          .select()
          .single();
        
        if (createError) {
          console.error(`${entityType} yaratma xətası:`, createError);
          return new Response(
            JSON.stringify({ error: `${entityType} yaratma xətası: ${createError.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        result = { success: true, data: createdItem, message: `${entityType} uğurla yaradıldı` };
        break;
        
      case 'read':
        if (!id) {
          // Id verilməyibsə, bütün elementləri qaytarırıq
          const { data: allItems, error: readAllError } = await supabase
            .from(table)
            .select('*');
          
          if (readAllError) {
            console.error(`${entityType} oxuma xətası:`, readAllError);
            return new Response(
              JSON.stringify({ error: `${entityType} oxuma xətası: ${readAllError.message}` }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
          }
          
          result = { success: true, data: allItems, message: `${entityType} elementləri uğurla oxundu` };
        } else {
          // Konkret elementi qaytarırıq
          const { data: singleItem, error: readError } = await supabase
            .from(table)
            .select('*')
            .eq('id', id)
            .single();
          
          if (readError) {
            console.error(`${entityType} oxuma xətası:`, readError);
            return new Response(
              JSON.stringify({ error: `${entityType} oxuma xətası: ${readError.message}` }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            );
          }
          
          result = { success: true, data: singleItem, message: `${entityType} elementi uğurla oxundu` };
        }
        break;
        
      case 'update':
        if (!id || !data) {
          return new Response(
            JSON.stringify({ error: 'Yeniləmə üçün id və data tələb olunur' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        // "data"nı genişləndiririk, yenilənmə zamanını əlavə edirik
        const updateData = { 
          ...data, 
          updated_at: new Date().toISOString() 
        };
        
        const { data: updatedItem, error: updateError } = await supabase
          .from(table)
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
        
        if (updateError) {
          console.error(`${entityType} yeniləmə xətası:`, updateError);
          return new Response(
            JSON.stringify({ error: `${entityType} yeniləmə xətası: ${updateError.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        result = { success: true, data: updatedItem, message: `${entityType} uğurla yeniləndi` };
        break;
        
      case 'delete':
        if (!id) {
          return new Response(
            JSON.stringify({ error: 'Silmə üçün id tələb olunur' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        const { data: deletedItem, error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('id', id)
          .select()
          .single();
        
        if (deleteError) {
          console.error(`${entityType} silmə xətası:`, deleteError);
          return new Response(
            JSON.stringify({ error: `${entityType} silmə xətası: ${deleteError.message}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        result = { success: true, data: deletedItem, message: `${entityType} uğurla silindi` };
        break;
    }
    
    // Log əməliyyat nəticəsini
    console.log(`${entityType} ${action} əməliyyatı uğurlu oldu:`, result);
    
    // Uğurlu cavab
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Gözlənilməz xəta:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Gözlənilməz xəta: ${error instanceof Error ? error.message : String(error)}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

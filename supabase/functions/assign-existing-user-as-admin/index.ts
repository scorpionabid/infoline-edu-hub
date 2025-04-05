
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// CORS başlıqları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// CORS sorğuları üçün əsas cavab
function handleCorsRequest() {
  return new Response(null, { headers: corsHeaders });
}

// Xəta halında cavab yaratmaq
function createErrorResponse(message: string, details: any = null, status = 400) {
  console.error(`Xəta: ${message}`, details ? JSON.stringify(details) : '');
  return new Response(
    JSON.stringify({ error: message, details }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status }
  );
}

// Uğurlu sorğu üçün cavab yaratmaq
function createSuccessResponse(data: any) {
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  );
}

// Supabase client yaratmaq
function createSupabaseClient(authHeader: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  // Service role key istifadə edirik - bu SuperAdmin səlahiyyətləri verir
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  console.log("Supabase URL:", supabaseUrl);
  console.log("Auth header:", authHeader ? "Mövcuddur" : "Yoxdur");
  
  // Admin rejimində client yaradırıq
  return createClient(
    supabaseUrl,
    supabaseKey,
    { 
      global: { 
        headers: { Authorization: authHeader } 
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Mövcud istifadəçinin rolunu regionadmin kimi təyin etmək
async function assignUserAsRegionAdmin(supabaseClient: any, userId: string, regionId: string) {
  try {
    // Əvvəlcə istifadəçinin mövcudluğunu yoxlayaq
    const { data: user, error: userError } = await supabaseClient
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error(`İstifadəçi tapılmadı: ${userError?.message || 'Naməlum xəta'}`);
    }

    console.log('İstifadəçi tapıldı:', user);
    
    // Regionun mövcudluğunu yoxlayaq
    const { data: region, error: regionError } = await supabaseClient
      .from('regions')
      .select('id, name')
      .eq('id', regionId)
      .single();
      
    if (regionError || !region) {
      throw new Error(`Region tapılmadı: ${regionError?.message || 'Naməlum xəta'}`);
    }
    
    console.log('Region tapıldı:', region);

    // İstifadəçinin cari rolunu yoxlayaq və regionadmin olub olmadığını təyin edək
    const { data: existingRoles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);
      
    if (rolesError) {
      console.error('İstifadəçi rolları yoxlanarkən xəta:', rolesError);
      throw rolesError;
    }
    
    // Əgər istifadəçi artıq regionadmin roluna malikdirsə, rolu yeniləyək
    const hasRegionAdminRole = existingRoles.some(role => role.role === 'regionadmin');
    
    if (hasRegionAdminRole) {
      // Mövcud regionadmin rolunu yeniləyək
      const { data: updatedRole, error: updateError } = await supabaseClient
        .from('user_roles')
        .update({
          region_id: regionId,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('role', 'regionadmin')
        .select();
        
      if (updateError) {
        console.error('Rol yeniləmə xətası:', updateError);
        throw updateError;
      }
      
      console.log('İstifadəçi rolu yeniləndi:', updatedRole);
    } else {
      // Yeni regionadmin rolu əlavə edək
      const { data: newRole, error: insertError } = await supabaseClient
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'regionadmin',
          region_id: regionId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
        
      if (insertError) {
        console.error('Rol əlavə etmə xətası:', insertError);
        throw insertError;
      }
      
      console.log('Yeni rol yaradıldı:', newRole);
    }
    
    // Region-də admin məlumatlarını yeniləyək
    const { data: updatedRegion, error: updateRegionError } = await supabaseClient
      .from('regions')
      .update({
        admin_id: userId,
        admin_email: user.email,
        updated_at: new Date().toISOString()
      })
      .eq('id', regionId)
      .select();
      
    if (updateRegionError) {
      console.error('Region yeniləmə xətası:', updateRegionError);
      throw updateRegionError;
    }
    
    console.log('Region məlumatları yeniləndi:', updatedRegion);
    
    // Audit log əlavə edək
    try {
      await supabaseClient
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'assign_admin',
          entity_type: 'region',
          entity_id: regionId,
          new_value: JSON.stringify({
            region_id: regionId,
            region_name: region.name,
            admin_id: userId,
            admin_name: user.full_name,
            admin_email: user.email
          })
        });
        
      console.log('Audit log yaradıldı');
    } catch (auditError) {
      console.error('Audit log yaradılarkən xəta:', auditError);
      // Audit log xətası əsas əməliyyatı dayandırmamalıdır
    }
    
    return {
      success: true,
      admin: {
        id: user.id,
        name: user.full_name,
        email: user.email
      },
      region: {
        id: region.id,
        name: region.name
      }
    };
  } catch (error) {
    console.error('Admin təyin etmə xətası:', error);
    throw error;
  }
}

// Ana handler funksiyası
serve(async (req) => {
  // CORS preflight işləmə
  if (req.method === 'OPTIONS') {
    return handleCorsRequest();
  }

  try {
    // Auth başlığını al
    const authHeader = req.headers.get('Authorization') || '';
    
    // Supabase müştərisini yarat - Service role key ilə SuperAdmin səlahiyyətli
    const supabaseClient = createSupabaseClient(authHeader);

    // Request body'ni al
    const requestData = await req.json();
    const { userId, regionId } = requestData;
    
    if (!userId) {
      return createErrorResponse('İstifadəçi ID tələb olunur');
    }
    
    if (!regionId) {
      return createErrorResponse('Region ID tələb olunur');
    }
    
    try {
      const result = await assignUserAsRegionAdmin(supabaseClient, userId, regionId);
      return createSuccessResponse(result);
    } catch (error: any) {
      const errorMessage = error.message || 'Admin təyin edilərkən xəta baş verdi';
      return createErrorResponse(errorMessage, error, 400);
    }
  } catch (error: any) {
    return createErrorResponse('Gözlənilməz xəta baş verdi: ' + (error.message || 'Naməlum xəta'), error, 500);
  }
});

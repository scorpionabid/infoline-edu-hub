
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// CORS başlıqları
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Xəta cavabı yaradır
function createErrorResponse(message: string, status: number = 400) {
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status: status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Supabase konfiqurasiyasını alır
function getSupabaseConfig() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase URL və ya Service Key tapılmadı');
    return null;
  }
  
  return { supabaseUrl, supabaseServiceKey };
}

// Supabase client yaradır
function createSupabaseAdmin(config: { supabaseUrl: string, supabaseServiceKey: string }) {
  return createClient(config.supabaseUrl, config.supabaseServiceKey);
}

// İstifadəçi profil məlumatlarını əldə edir
async function getUserProfileData(supabaseAdmin: any, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, email')
    .eq('id', userId)
    .maybeSingle();
    
  if (error) {
    console.error('Profil məlumatları alınarkən xəta:', error);
    throw new Error(`Profil məlumatları tapılmadı: ${error.message}`);
  }
  
  if (!data) {
    console.error('Profil məlumatları tapılmadı');
    throw new Error('İstifadəçi profili tapılmadı');
  }
  
  return data;
}

// İstifadəçi email məlumatını əldə edir
async function getUserEmail(supabaseAdmin: any, userId: string, profileEmail: string) {
  try {
    const { data, error } = await supabaseAdmin.rpc(
      'get_user_emails_by_ids',
      { user_ids: [userId] }
    );

    // Əgər RPC funksiyası uğurlu olsa və məlumat qaytarsa
    if (!error && data && data.length > 0) {
      return data[0].email; // RPC-dən gələn emaili üstünlük veririk
    }
    
    // Xəta olsa və ya məlumat tapılmasa, profile email-i istifadə edirik
    return profileEmail;
  } catch (error) {
    console.warn('Email əldə edilərkən xəta:', error);
    return profileEmail; // Xəta halında profildəki emaili qaytarırıq
  }
}

// Region məlumatlarını əldə edir
async function getRegionData(supabaseAdmin: any, regionId: string) {
  const { data, error } = await supabaseAdmin
    .from('regions')
    .select('id, name')
    .eq('id', regionId)
    .maybeSingle();
    
  if (error) {
    console.error('Region tapılmadı (xəta):', error);
    throw new Error(`Region tapılmadı: ${error.message}`);
  }
  
  if (!data) {
    console.error('Region tapılmadı (data boş)');
    throw new Error('Region tapılmadı - veri boş');
  }
  
  return data;
}

// Mövcud admin rollarını silir
async function deleteExistingAdminRoles(supabaseAdmin: any, userId: string) {
  console.log(`${userId} istifadəçisinin köhnə admin rolları silinir...`);
  
  // İstifadəçinin bütün admin rollarını sil
  const { error } = await supabaseAdmin
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .in('role', ['regionadmin', 'sectoradmin', 'schooladmin']);
    
  if (error) {
    console.error('Köhnə admin rolları silinərkən xəta:', error);
    throw new Error(`Köhnə rolları silərkən xəta: ${error.message}`);
  }
  
  console.log('Köhnə admin rolları silindi');
}

// Yeni regionadmin rolu əlavə edir
async function addRegionAdminRole(supabaseAdmin: any, userId: string, regionId: string) {
  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('user_roles')
    .insert({
      user_id: userId,
      role: 'regionadmin',
      region_id: regionId,
      created_at: now,
      updated_at: now
    })
    .select();
    
  if (error) {
    console.error('Rol əlavə etmə xətası:', error);
    throw new Error(`Rol əlavə etmə xətası: ${error.message}`);
  }
  
  if (!data || data.length === 0) {
    console.error('Rol əlavə edilsə də, məlumat qaytarılmadı');
    throw new Error('Rol əlavə etmə xətası: Məlumat qaytarılmadı');
  }
  
  return data[0];
}

// Region-də admin məlumatlarını yeniləyir
async function updateRegionAdminInfo(supabaseAdmin: any, regionId: string, userId: string, userEmail: string) {
  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('regions')
    .update({
      admin_id: userId,
      admin_email: userEmail,
      updated_at: now
    })
    .eq('id', regionId)
    .select();
    
  if (error) {
    console.error('Region yeniləmə xətası:', error);
    throw new Error(`Region yeniləmə xətası: ${error.message}`);
  }
  
  return data;
}

// Audit log əlavə edir
async function addAuditLog(supabaseAdmin: any, userId: string, regionId: string, regionName: string, adminName: string, adminEmail: string) {
  try {
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'assign_admin',
        entity_type: 'region',
        entity_id: regionId,
        new_value: JSON.stringify({
          region_id: regionId,
          region_name: regionName,
          admin_id: userId,
          admin_name: adminName,
          admin_email: adminEmail
        })
      });
      
    console.log('Audit log yaradıldı');
  } catch (error) {
    console.error('Audit log yaradılarkən xəta:', error);
    // Audit log xətası əsas əməliyyatı dayandırmamalıdır
  }
}

// Admin təyin etmə prosesi
async function assignAdminProcess(supabaseAdmin: any, userId: string, regionId: string) {
  try {
    // İstifadəçi məlumatlarını əldə et
    const profileData = await getUserProfileData(supabaseAdmin, userId);
    const userEmail = await getUserEmail(supabaseAdmin, userId, profileData.email);
    
    // Region məlumatlarını əldə et
    const regionData = await getRegionData(supabaseAdmin, regionId);
    
    // Mövcud admin rollarını sil
    await deleteExistingAdminRoles(supabaseAdmin, userId);
    
    // Yeni regionadmin rolu əlavə et
    const newRole = await addRegionAdminRole(supabaseAdmin, userId, regionId);
    
    // Region-də admin məlumatlarını yenilə
    await updateRegionAdminInfo(supabaseAdmin, regionId, userId, userEmail);
    
    // Audit log əlavə et
    await addAuditLog(
      supabaseAdmin, 
      userId, 
      regionId, 
      regionData.name, 
      profileData.full_name, 
      userEmail
    );
    
    // Uğurlu nəticə
    return {
      success: true,
      admin: {
        id: userId,
        name: profileData.full_name,
        email: userEmail
      },
      region: {
        id: regionId,
        name: regionData.name
      },
      role: newRole
    };
  } catch (error: any) {
    console.error('Admin təyin etmə xətası:', error);
    throw error;
  }
}

// Ana handler funksiyası
serve(async (req) => {
  // CORS preflight işləmə
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Konfiqurasiya parametrlərini al
    const config = getSupabaseConfig();
    if (!config) {
      return createErrorResponse('Server konfiqurasyonu səhvdir', 500);
    }
    
    // Supabase admin client yaratma
    const supabaseAdmin = createSupabaseAdmin(config);

    // Request body-ni al və aç
    let body;
    try {
      body = await req.json();
      console.log('Request body:', body);
    } catch (parseError) {
      console.error('JSON parse xətası:', parseError);
      return createErrorResponse('Request body JSON formatında olmalıdır', 400);
    }
    
    // userId və regionId doğrulamaq
    const { userId, regionId } = body;
    
    if (!userId) {
      console.error('İstifadəçi ID tapılmadı');
      return createErrorResponse('İstifadəçi ID tələb olunur', 400);
    }
    
    if (!regionId) {
      console.error('Region ID tapılmadı');
      return createErrorResponse('Region ID tələb olunur', 400);
    }

    console.log(`Region admin təyinatı başladı: User ID: ${userId}, Region ID: ${regionId}`);

    try {
      // Admin təyin etmə prosesini başlat
      const result = await assignAdminProcess(supabaseAdmin, userId, regionId);
      
      // Uğurlu cavab
      return new Response(
        JSON.stringify(result),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (error: any) {
      return createErrorResponse(error.message || 'Admin təyin edilərkən xəta baş verdi', 400);
    }
  } catch (error: any) {
    console.error('Gözlənilməz xəta:', error);
    return createErrorResponse('Gözlənilməz xəta baş verdi: ' + (error.message || 'Naməlum xəta'), 500);
  }
});

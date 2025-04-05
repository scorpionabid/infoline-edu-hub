
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  console.log("Supabase URL:", supabaseUrl);
  console.log("Auth header:", authHeader ? "Mövcuddur" : "Yoxdur");
  
  return createClient(
    supabaseUrl,
    supabaseKey,
    { global: { headers: { Authorization: authHeader } } }
  );
}

// Bölgə adının unikallığının yoxlanılması
async function checkRegionNameExists(supabaseClient: any, regionName: string) {
  try {
    const { data: existingRegion, error: regionCheckError } = await supabaseClient
      .from('regions')
      .select('id')
      .eq('name', regionName)
      .maybeSingle();

    if (regionCheckError) {
      console.error('Region yoxlanış xətası:', regionCheckError);
    }

    return existingRegion;
  } catch (checkError) {
    console.error('Region mövcudluq yoxlama xətası:', checkError);
    return null;
  }
}

// İstifadəçi emailinin unikallığının yoxlanılması
async function checkUserEmailExists(supabaseClient: any, email: string) {
  if (!email) return null;
  
  try {
    // getUserByEmail metodu olmadığından direct auth istifadəçilərinə sorğu edirik
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('İstifadəçi yoxlama xətası:', error);
    }

    return data;
  } catch (error) {
    console.log('İstifadəçi yoxlanarkən xəta:', error);
    return null;
  }
}

// Yeni region yaratmaq
async function createRegion(supabaseClient: any, regionData: any) {
  const { regionName, regionDescription, regionStatus } = regionData;
  
  try {
    const { data: newRegion, error: regionError } = await supabaseClient
      .from('regions')
      .insert({
        name: regionName,
        description: regionDescription,
        status: regionStatus || 'active'
      })
      .select()
      .single();

    if (regionError) {
      throw regionError;
    }

    console.log('Region uğurla yaradıldı:', newRegion);
    return newRegion;
  } catch (error) {
    console.error('Region yaradılma xətası:', error);
    throw error;
  }
}

// Admin istifadəçi yaratmaq
async function createAdminUser(supabaseClient: any, adminData: any, regionId: string) {
  const { adminName, adminEmail, adminPassword } = adminData;
  
  if (!adminEmail || !adminName || !adminPassword) {
    return null;
  }
  
  try {
    console.log('Admin yaradılır...');
    
    // Admin istifadəçi yarat
    const { data: newUser, error: userError } = await supabaseClient.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: adminName,
        role: 'regionadmin',
        region_id: regionId
      }
    });

    if (userError) {
      throw userError;
    }

    console.log('Admin uğurla yaradıldı:', newUser?.user?.id);
    return newUser?.user;
  } catch (error) {
    console.error('Admin yaradılma xətası:', error);
    throw error;
  }
}

// İstifadəçi rolunu əlavə etmək
async function createUserRole(supabaseClient: any, userId: string, regionId: string) {
  try {
    // User_roles cədvəlində yeganəlik yoxlaması
    const { data: existingRole, error: roleCheckError } = await supabaseClient
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'regionadmin')
      .eq('region_id', regionId)
      .maybeSingle();

    if (roleCheckError) {
      console.error('Rol yoxlama xətası:', roleCheckError);
    }

    // Əgər rol mövcud deyilsə, əlavə et
    if (!existingRole) {
      console.log('Rol yaradılır...');
      const { error: roleError } = await supabaseClient
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'regionadmin',
          region_id: regionId
        });

      if (roleError) {
        console.error('Rol yaradılma xətası:', roleError);
        throw roleError;
      } else {
        console.log('Rol uğurla yaradıldı');
      }
    }
  } catch (error) {
    console.error('Rol yaradılma xətası:', error);
    throw error;
  }
}

// Audit loq əlavə etmək
async function addAuditLog(supabaseClient: any, userId: string, regionId: string, regionData: any, adminData: any) {
  try {
    console.log('Audit loq əlavə edilir...');
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'create',
        entity_type: 'region',
        entity_id: regionId,
        new_value: JSON.stringify({
          region: regionData,
          admin: adminData
        })
      });
      
    console.log('Audit loq uğurla əlavə edildi');
  } catch (error) {
    console.error('Audit loq əlavə edilərkən xəta:', error);
    // Audit log əlavə edilməsə də prosesi dayandırmırıq
  }
}

// Region admin məlumatlarını yeniləmək
async function updateRegionAdminInfo(supabaseClient: any, regionId: string, userId: string, adminEmail: string) {
  try {
    console.log('Region admin məlumatları yenilənir...');
    await supabaseClient
      .from('regions')
      .update({ 
        admin_id: userId,
        admin_email: adminEmail 
      })
      .eq('id', regionId);
      
    console.log('Region admin məlumatları uğurla yeniləndi');
  } catch (error) {
    console.error('Region admin məlumatları yenilənərkən xəta:', error);
    throw error;
  }
}

// Xəta halında regionu silmək
async function deleteRegionOnError(supabaseClient: any, regionId: string) {
  try {
    await supabaseClient
      .from('regions')
      .delete()
      .eq('id', regionId);
    
    console.log('Xəta baş verdiyi üçün region silindi:', regionId);
  } catch (deleteError) {
    console.error('Region silinərkən xəta:', deleteError);
  }
}

// Əsas funksiya - Region və Admin yaratmaq
async function createRegionWithAdmin(supabaseClient: any, requestData: any) {
  const { 
    regionName, 
    regionDescription, 
    regionStatus, 
    adminName, 
    adminEmail, 
    adminPassword 
  } = requestData;
  
  console.log('Gələn məlumatlar:', JSON.stringify({ 
    regionName, 
    regionDescription, 
    regionStatus, 
    adminName, 
    adminEmail: adminEmail ? `${adminEmail.substring(0, 3)}...` : undefined 
  }, null, 2));

  // Region adı validasiyası
  if (!regionName) {
    throw new Error('Region adı tələb olunur');
  }

  // Region adının yoxlanması
  const existingRegion = await checkRegionNameExists(supabaseClient, regionName);
  if (existingRegion) {
    throw new Error(`"${regionName}" adlı region artıq mövcuddur`);
  }

  // Email validasiyası
  if (adminEmail) {
    const existingUser = await checkUserEmailExists(supabaseClient, adminEmail);
    if (existingUser) {
      throw new Error(`"${adminEmail}" email ünvanı ilə istifadəçi artıq mövcuddur`);
    }
  }

  // Yeni region yaratmaq
  const newRegion = await createRegion(supabaseClient, {
    regionName,
    regionDescription,
    regionStatus
  });

  // Admin məlumatları
  let adminData = null;
  
  try {
    // Əgər admin məlumatları varsa, admin istifadəçi yarat
    if (adminEmail && adminName && adminPassword) {
      // Admin istifadəçi yaratmaq
      const newUser = await createAdminUser(supabaseClient, {
        adminName,
        adminEmail,
        adminPassword
      }, newRegion.id);
      
      if (newUser) {
        // İstifadəçi rolunu əlavə etmək
        await createUserRole(supabaseClient, newUser.id, newRegion.id);
        
        // Audit loq əlavə etmək
        await addAuditLog(supabaseClient, newUser.id, newRegion.id, newRegion, {
          id: newUser.id,
          email: adminEmail,
          name: adminName
        });
        
        // Region admin məlumatlarını yeniləmək
        await updateRegionAdminInfo(supabaseClient, newRegion.id, newUser.id, adminEmail);
        
        adminData = {
          id: newUser.id,
          email: adminEmail,
          name: adminName
        };
      }
    }
    
    return {
      success: true,
      region: newRegion,
      admin: adminData
    };
  } catch (error) {
    // Xəta baş verərsə, yaradılmış regionu sil
    await deleteRegionOnError(supabaseClient, newRegion.id);
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return createErrorResponse('Authorization başlığı tapılmadı', null, 401);
    }

    // Supabase müştərisini yarat
    const supabaseClient = createSupabaseClient(authHeader);

    // Request body'ni al
    const requestData = await req.json();
    
    // Region və Admin yaratma
    try {
      const result = await createRegionWithAdmin(supabaseClient, requestData);
      return createSuccessResponse(result);
    } catch (error) {
      return createErrorResponse(error.message || 'Region yaradılarkən xəta baş verdi', error, 400);
    }
  } catch (error) {
    return createErrorResponse('Gözlənilməz xəta baş verdi', error, 500);
  }
});

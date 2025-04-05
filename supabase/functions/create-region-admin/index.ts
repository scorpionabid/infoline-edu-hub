
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

// Sorğu məlumatlarını validasiya etmək
function validateRequestData(data: any) {
  const { regionName, skipAdminCreation = false, adminName, adminEmail, adminPassword } = data;
  
  // Region adı hökmən olmalıdır
  if (!regionName) {
    throw new Error('Region adı tələb olunur');
  }
  
  // Əgər admin yaratmaq istəyiriksə, bütün məlumatlar olmalıdır
  if (!skipAdminCreation) {
    if (!adminName) {
      throw new Error('Admin adı tələb olunur');
    }
    if (!adminEmail) {
      throw new Error('Admin email tələb olunur');
    }
    if (!adminPassword) {
      throw new Error('Admin şifrəsi tələb olunur');
    }
  }
  
  return { isValid: true };
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
    // profiles cədvəlində email üzrə yoxlayırıq
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('İstifadəçi yoxlama xətası:', error);
    }

    // Həmçinin auth.users cədvəlində də yoxlamaq üçün auth.users-ə birbaşa sorğu edək
    const { data: authUser, error: authError } = await supabaseClient.auth.admin.listUsers({
      filter: { email: email }
    });

    if (authError) {
      console.error('Auth istifadəçi yoxlama xətası:', authError);
    }

    const userExists = data || (authUser?.users?.length > 0);
    console.log(`Email "${email}" yoxlanışı:`, userExists ? 'Mövcuddur' : 'Mövcud deyil');
    
    return userExists;
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
    console.log('Admin məlumatları tam deyil, admin yaradılmır');
    return null;
  }
  
  try {
    console.log('Admin yaradılır...', { name: adminName, email: adminEmail });
    
    // SuperAdmin səlahiyyətləri ilə admin istifadəçi yaradırıq
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
      console.error('Admin yaradılma xətası (ətraflı):', JSON.stringify(userError));
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
      console.log('Rol yaradılır...', { user_id: userId, region_id: regionId });
      const { data: roleData, error: roleError } = await supabaseClient
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'regionadmin',
          region_id: regionId
        })
        .select();

      if (roleError) {
        console.error('Rol yaradılma xətası:', roleError);
        throw roleError;
      } else {
        console.log('Rol uğurla yaradıldı:', roleData);
      }
      
      return roleData;
    }
    
    return existingRole;
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
          admin: adminData ? {
            id: adminData.id,
            email: adminData.email,
            name: adminData.name
          } : null
        })
      });
      
    console.log('Audit loq uğurla əlavə edildi');
  } catch (error) {
    console.error('Audit loq əlavə edilərkən xəta:', error);
    // Audit log əlavə edilməsə də prosesi dayandırmırıq
  }
}

// Region admin məlumatlarını yeniləmək
async function updateRegionAdminInfo(supabaseClient: any, regionId: string, userId: string | null, adminEmail: string | null) {
  try {
    if (!userId || !adminEmail) {
      console.log('Admin məlumatları olmadığı üçün region admin məlumatları yenilənmir');
      return;
    }
    
    console.log('Region admin məlumatları yenilənir...', { region_id: regionId, admin_id: userId, admin_email: adminEmail });
    const { data, error } = await supabaseClient
      .from('regions')
      .update({ 
        admin_id: userId,
        admin_email: adminEmail 
      })
      .eq('id', regionId)
      .select();
      
    if (error) {
      console.error('Region admin məlumatları yenilənərkən xəta:', error);
      throw error;
    }
    
    console.log('Region admin məlumatları uğurla yeniləndi:', data);
    return data;
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
    adminPassword,
    skipAdminCreation = false,
    currentUserEmail
  } = requestData;
  
  // Məlumatları loglamaq (həssas məlumatlar gizlədilir)
  console.log('Gələn məlumatları:', JSON.stringify({ 
    regionName, 
    regionDescription, 
    regionStatus,
    skipAdminCreation,
    adminName: adminName ? '***' : undefined,
    adminEmail: adminEmail ? `${adminEmail.substring(0, 3)}***` : undefined,
    currentUserEmail: currentUserEmail ? `${currentUserEmail.substring(0, 3)}***` : undefined
  }, null, 2));

  // Məlumatların validasiyası
  validateRequestData(requestData);

  // Region adının yoxlanması
  const existingRegion = await checkRegionNameExists(supabaseClient, regionName);
  if (existingRegion) {
    throw new Error(`"${regionName}" adlı region artıq mövcuddur`);
  }

  // Email validasiyası (admin yaradılacaqsa)
  if (!skipAdminCreation && adminEmail) {
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
  let userRoleData = null;
  
  try {
    // Əgər admin yaradılacaqsa və admin məlumatları varsa, admin istifadəçi yarat
    if (!skipAdminCreation && adminEmail && adminName && adminPassword) {
      try {
        // Admin istifadəçi yaratmaq
        const newUser = await createAdminUser(supabaseClient, {
          adminName,
          adminEmail,
          adminPassword
        }, newRegion.id);
        
        if (newUser) {
          // İstifadəçi rolunu əlavə etmək
          userRoleData = await createUserRole(supabaseClient, newUser.id, newRegion.id);
          
          // Region admin məlumatlarını yeniləmək
          await updateRegionAdminInfo(supabaseClient, newRegion.id, newUser.id, adminEmail);
          
          // Audit loq məlumatları hazırla
          adminData = {
            id: newUser.id,
            email: adminEmail,
            name: adminName
          };
        }
      } catch (adminError: any) {
        console.error('Admin yaradılarkən xəta:', adminError);
        // Admin yaradılma xətasını irəli ötürək
        throw new Error(`Admin yaradılarkən xəta: ${adminError.message || 'Naməlum xəta'}`);
      }
    }
    
    // İstifadəçiyə aid audit loq əlavə etmək
    try {
      // Mövcud istifadəçi ID-sini al (əgər mümkünsə)
      let userId = null;
      
      if (currentUserEmail) {
        const { data: userProfile } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('email', currentUserEmail)
          .maybeSingle();
        
        userId = userProfile?.id;
      }
      
      if (userId) {
        await addAuditLog(supabaseClient, userId, newRegion.id, newRegion, adminData);
      } else {
        console.log('İstifadəçi ID-si tapılmadığı üçün audit log yaradılmadı');
      }
    } catch (auditError) {
      console.error('Audit log yaradılarkən xəta:', auditError);
    }
    
    return {
      success: true,
      region: newRegion,
      admin: adminData,
      userRole: userRoleData,
      adminCreated: !!adminData
    };
  } catch (error) {
    // Xəta baş verərsə və region yaradılıbsa, onu sil
    if (newRegion?.id) {
      await deleteRegionOnError(supabaseClient, newRegion.id);
    }
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

    // Supabase müştərisini yarat - Service role key ilə SuperAdmin səlahiyyətli
    const supabaseClient = createSupabaseClient(authHeader);

    // Request body'ni al
    const requestData = await req.json();
    
    // Region və Admin yaratma
    try {
      const result = await createRegionWithAdmin(supabaseClient, requestData);
      return createSuccessResponse(result);
    } catch (error: any) {
      const errorMessage = error.message || 'Region yaradılarkən xəta baş verdi';
      return createErrorResponse(errorMessage, error, 400);
    }
  } catch (error: any) {
    return createErrorResponse('Gözlənilməz xəta baş verdi: ' + (error.message || 'Naməlum xəta'), error, 500);
  }
});

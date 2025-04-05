
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

// Audit loq əlavə etmək
async function addAuditLog(supabaseClient: any, userId: string, regionId: string, adminData: any) {
  try {
    console.log('Audit loq əlavə edilir...');
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'update',
        entity_type: 'region',
        entity_id: regionId,
        new_value: JSON.stringify({
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

// Əsas funksiya - Admin təyin etmək
async function assignRegionAdmin(supabaseClient: any, requestData: any) {
  const { 
    regionId, 
    adminName, 
    adminEmail, 
    adminPassword,
    currentUserEmail
  } = requestData;
  
  // Məlumatları loglamaq (həssas məlumatlar gizlədilir)
  console.log('Gələn məlumatları:', JSON.stringify({ 
    regionId, 
    adminName: adminName ? '***' : undefined,
    adminEmail: adminEmail ? `${adminEmail.substring(0, 3)}***` : undefined,
    currentUserEmail: currentUserEmail ? `${currentUserEmail.substring(0, 3)}***` : undefined
  }, null, 2));

  if (!regionId) {
    throw new Error('Region ID tələb olunur');
  }

  if (!adminName || !adminEmail || !adminPassword) {
    throw new Error('Admin məlumatları tam deyil');
  }

  // Email validasiyası
  const existingUser = await checkUserEmailExists(supabaseClient, adminEmail);
  if (existingUser) {
    throw new Error(`"${adminEmail}" email ünvanı ilə istifadəçi artıq mövcuddur`);
  }

  // Admin məlumatları
  let adminData = null;
  let userRoleData = null;
  
  try {
    // Admin istifadəçi yaratmaq
    const newUser = await createAdminUser(supabaseClient, {
      adminName,
      adminEmail,
      adminPassword
    }, regionId);
    
    if (newUser) {
      // İstifadəçi rolunu əlavə etmək
      userRoleData = await createUserRole(supabaseClient, newUser.id, regionId);
      
      // Region admin məlumatlarını yeniləmək
      await updateRegionAdminInfo(supabaseClient, regionId, newUser.id, adminEmail);
      
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
      await addAuditLog(supabaseClient, userId, regionId, adminData);
    } else {
      console.log('İstifadəçi ID-si tapılmadığı üçün audit log yaradılmadı');
    }
  } catch (auditError) {
    console.error('Audit log yaradılarkən xəta:', auditError);
  }
  
  return {
    success: true,
    admin: adminData,
    userRole: userRoleData,
    adminCreated: !!adminData
  };
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
    
    // Admin təyin etmə
    try {
      const result = await assignRegionAdmin(supabaseClient, requestData);
      return createSuccessResponse(result);
    } catch (error: any) {
      const errorMessage = error.message || 'Admin təyin edilərkən xəta baş verdi';
      return createErrorResponse(errorMessage, error, 400);
    }
  } catch (error: any) {
    return createErrorResponse('Gözlənilməz xəta baş verdi: ' + (error.message || 'Naməlum xəta'), error, 500);
  }
});

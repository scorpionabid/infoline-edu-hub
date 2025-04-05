
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

// Region adının unikallığının yoxlanılması
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

// Yeni region yaratmaq
async function createRegion(supabaseClient: any, regionData: any) {
  const { name, description, status } = regionData;
  
  try {
    const { data: newRegion, error: regionError } = await supabaseClient
      .from('regions')
      .insert({
        name: name,
        description: description,
        status: status || 'active'
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

// Audit loq əlavə etmək
async function addAuditLog(supabaseClient: any, userId: string, regionId: string, regionData: any) {
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
          region: regionData
        })
      });
      
    console.log('Audit loq uğurla əlavə edildi');
  } catch (error) {
    console.error('Audit loq əlavə edilərkən xəta:', error);
    // Audit log əlavə edilməsə də prosesi dayandırmırıq
  }
}

// Əsas funksiya - Region yaratmaq
async function createRegionOnly(supabaseClient: any, requestData: any) {
  const { 
    name, 
    description, 
    status,
    currentUserEmail
  } = requestData;
  
  // Məlumatları loglamaq
  console.log('Gələn məlumatları:', JSON.stringify({ 
    name, 
    description, 
    status,
    currentUserEmail: currentUserEmail ? `${currentUserEmail.substring(0, 3)}***` : undefined
  }, null, 2));

  // Region adının yoxlanması
  const existingRegion = await checkRegionNameExists(supabaseClient, name);
  if (existingRegion) {
    throw new Error(`"${name}" adlı region artıq mövcuddur`);
  }

  // Yeni region yaratmaq
  const newRegion = await createRegion(supabaseClient, {
    name,
    description,
    status
  });
    
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
      await addAuditLog(supabaseClient, userId, newRegion.id, newRegion);
    } else {
      console.log('İstifadəçi ID-si tapılmadığı üçün audit log yaradılmadı');
    }
  } catch (auditError) {
    console.error('Audit log yaradılarkən xəta:', auditError);
  }
  
  return {
    success: true,
    region: newRegion
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
    
    // Region yaratma
    try {
      const result = await createRegionOnly(supabaseClient, requestData);
      return createSuccessResponse(result);
    } catch (error: any) {
      const errorMessage = error.message || 'Region yaradılarkən xəta baş verdi';
      return createErrorResponse(errorMessage, error, 400);
    }
  } catch (error: any) {
    return createErrorResponse('Gözlənilməz xəta baş verdi: ' + (error.message || 'Naməlum xəta'), error, 500);
  }
});

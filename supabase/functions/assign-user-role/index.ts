
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

interface AssignUserRoleParams {
  userId: string;
  role: "superadmin" | "regionadmin" | "sectoradmin" | "schooladmin";
  entityId?: string; // region_id, sector_id, school_id
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Not authorized', details: authError }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Gönderilen parametreleri al
    const { userId, role, entityId } = await req.json() as AssignUserRoleParams

    // Kullanıcının yetkisini kontrol et (örneğin, sadece süper adminler veya bölge adminleri atama yapabilir)
    const { data: userRole, error: userRoleError } = await supabaseClient.rpc('get_user_role', {
      user_id: user.id
    })

    if (userRoleError) {
      return new Response(JSON.stringify({ error: 'Error checking user role', details: userRoleError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Yetki kontrolü
    if (userRole !== 'superadmin' && 
        !(userRole === 'regionadmin' && (role === 'sectoradmin' || role === 'schooladmin')) && 
        !(userRole === 'sectoradmin' && role === 'schooladmin')) {
      return new Response(JSON.stringify({ error: 'Not authorized to assign this role' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Role göre atama yapılacak nesneyi belirle
    let roleData = {
      user_id: userId,
      role: role,
      region_id: null, 
      sector_id: null,
      school_id: null
    }

    // EntityId'ye göre doğru alanı ayarla
    if (entityId) {
      if (role === 'regionadmin') {
        roleData.region_id = entityId;
      } else if (role === 'sectoradmin') {
        // Sektör için region_id'yi de belirlememiz gerekir
        const { data: sector, error: sectorError } = await supabaseClient
          .from('sectors')
          .select('region_id')
          .eq('id', entityId)
          .single();
        
        if (sectorError || !sector) {
          return new Response(JSON.stringify({ error: 'Sector not found', details: sectorError }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        roleData.sector_id = entityId;
        roleData.region_id = sector.region_id;
      } else if (role === 'schooladmin') {
        // Okul için sector_id ve region_id'yi de belirlememiz gerekir
        const { data: school, error: schoolError } = await supabaseClient
          .from('schools')
          .select('sector_id, region_id')
          .eq('id', entityId)
          .single();
        
        if (schoolError || !school) {
          return new Response(JSON.stringify({ error: 'School not found', details: schoolError }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        roleData.school_id = entityId;
        roleData.sector_id = school.sector_id;
        roleData.region_id = school.region_id;
      }
    }

    // Önce mevcut rolü sil
    const { error: deleteError } = await supabaseClient
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      return new Response(JSON.stringify({ error: 'Error deleting existing role', details: deleteError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Yeni rolü ata
    const { data: insertData, error: insertError } = await supabaseClient
      .from('user_roles')
      .insert([roleData])
      .select();

    if (insertError) {
      return new Response(JSON.stringify({ error: 'Error assigning role', details: insertError }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Gerekli durumlarda ilişkili tabloları güncelle
    if (role === 'regionadmin' && entityId) {
      await supabaseClient
        .from('regions')
        .update({ admin_id: userId })
        .eq('id', entityId);
    } else if (role === 'sectoradmin' && entityId) {
      await supabaseClient
        .from('sectors')
        .update({ admin_id: userId })
        .eq('id', entityId);
    } else if (role === 'schooladmin' && entityId) {
      await supabaseClient
        .from('schools')
        .update({ admin_id: userId })
        .eq('id', entityId);
    }

    return new Response(JSON.stringify({ success: true, data: insertData }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error assigning user role:', error)
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

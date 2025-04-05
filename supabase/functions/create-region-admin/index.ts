
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight işləmə
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Auth başlığını al
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization başlığı tapılmadı' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Supabase müştərisini yarat
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Request body'ni al
    const requestData = await req.json()
    const { 
      regionName, 
      regionDescription, 
      regionStatus, 
      adminEmail, 
      adminName, 
      adminPassword 
    } = requestData

    console.log('Gələn məlumatlar:', { regionName, adminEmail })

    // Regionun adına görə yoxlanılması
    const { data: existingRegion } = await supabaseClient
      .from('regions')
      .select('id')
      .eq('name', regionName)
      .single()

    if (existingRegion) {
      return new Response(
        JSON.stringify({ error: `"${regionName}" adlı region artıq mövcuddur` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Eyni emailli istifadəçinin yoxlanması
    const { data: existingUser } = await supabaseClient.auth.admin.getUserByEmail(adminEmail)
    if (existingUser) {
      return new Response(
        JSON.stringify({ error: `"${adminEmail}" email ünvanı ilə istifadəçi artıq mövcuddur` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Yeni region yarat
    const { data: newRegion, error: regionError } = await supabaseClient
      .from('regions')
      .insert({
        name: regionName,
        description: regionDescription,
        status: regionStatus || 'active'
      })
      .select()
      .single()

    if (regionError) {
      console.error('Region yaradılma xətası:', regionError)
      return new Response(
        JSON.stringify({ error: 'Region yaradılarkən xəta baş verdi', details: regionError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Admin istifadəçi yarat
    const { data: newUser, error: userError } = await supabaseClient.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: adminName,
        role: 'regionadmin',
        region_id: newRegion.id
      }
    })

    if (userError) {
      console.error('İstifadəçi yaradılma xətası:', userError)
      
      // Xəta baş verdikdə yaradılmış regionu silin
      await supabaseClient
        .from('regions')
        .delete()
        .eq('id', newRegion.id)
      
      return new Response(
        JSON.stringify({ error: 'Admin yaradılarkən xəta baş verdi', details: userError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // User_roles cədvəlində yeganəlik yoxlaması
    const { data: existingRole, error: roleCheckError } = await supabaseClient
      .from('user_roles')
      .select('*')
      .eq('user_id', newUser.user.id)
      .eq('role', 'regionadmin')
      .eq('region_id', newRegion.id)
      .maybeSingle()

    // Əgər rol mövcud deyilsə, əlavə et
    if (!existingRole) {
      const { error: roleError } = await supabaseClient
        .from('user_roles')
        .insert({
          user_id: newUser.user.id,
          role: 'regionadmin',
          region_id: newRegion.id
        })

      if (roleError) {
        console.error('Rol yaradılma xətası:', roleError)
      }
    }

    // Audit loq əlavə et
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: newUser.user.id,
        action: 'create',
        entity_type: 'region',
        entity_id: newRegion.id,
        new_value: JSON.stringify({
          region: newRegion,
          admin: {
            id: newUser.user.id,
            email: adminEmail,
            name: adminName
          }
        })
      })

    // Update admin_id in regions table
    await supabaseClient
      .from('regions')
      .update({ 
        admin_id: newUser.user.id,
        admin_email: adminEmail 
      })
      .eq('id', newRegion.id)
    
    // Uğurlu cavab döndər
    return new Response(
      JSON.stringify({ 
        success: true, 
        region: newRegion,
        admin: {
          id: newUser.user.id,
          email: adminEmail,
          name: adminName
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Ümumi xəta:', error)
    return new Response(
      JSON.stringify({ error: 'Gözlənilməz xəta baş verdi', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

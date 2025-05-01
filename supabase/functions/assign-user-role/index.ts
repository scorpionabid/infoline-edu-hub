
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import type { AssignUserRoleParams } from '../_shared/types.ts'

serve(async (req) => {
  // CORS idarəsi
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Giriş parametrləri
    const { userId, role, entityId } = await req.json() as AssignUserRoleParams
    
    // Parametrləri yoxlayırıq
    if (!userId || !role) {
      return new Response(
        JSON.stringify({
          error: 'userId və role tələb olunur'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // İcazə yoxlaması üçün admin klientini yaradırıq
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // İcazə yoxlaması və istifadəçi rolunu təyin edirəm
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    // Əgər user yoxdursa və ya superadmin deyilsə xəta qaytarırıq
    // (region və sector adminlərinin də müəyyən icazələri ola bilər, bu halda əlavə icazə yoxlamaları əlavə edə bilərsiniz)
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // İstifadəçinin rolunu yoxlayırıq
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Yalnız superadmin istifadəçisinə icazə veririk
    // (region və sector adminlərinə də icazə vermək üçün əlavə şərtlər əlavə edə bilərsiniz)
    if (!userRole || userRole.role !== 'superadmin') {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Təyin ediləcək istifadəçinin bazada olub-olmadığını yoxlayırıq
    const { data: existingUser, error: userCheckError } = await supabaseClient.auth.admin.getUserById(userId)

    if (userCheckError || !existingUser) {
      return new Response(
        JSON.stringify({ error: 'User not found', details: userCheckError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // İstifadəçinin mövcud rolu olub-olmadığını yoxlayırıq
    const { data: existingRole, error: roleCheckError } = await supabaseClient
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    // Əgər mövcud rol varsa update, yoxdursa insert əməliyyatı aparırıq
    let result

    // Rol tipinə görə müvafiq sahəni təyin edirik
    const roleData: Record<string, any> = {
      user_id: userId,
      role: role
    }

    // entityId əsasında müvafiq sahəni əlavə edirik
    switch (role) {
      case 'regionadmin':
        roleData.region_id = entityId
        break
      case 'sectoradmin':
        roleData.sector_id = entityId
        // Sektorun hansı regionda olduğunu tapırıq
        if (entityId) {
          const { data: sectorData } = await supabaseClient
            .from('sectors')
            .select('region_id')
            .eq('id', entityId)
            .single()
          
          if (sectorData) {
            roleData.region_id = sectorData.region_id
          }
        }
        break
      case 'schooladmin':
        roleData.school_id = entityId
        // Məktəbin hansı sektor və regionda olduğunu tapırıq
        if (entityId) {
          const { data: schoolData } = await supabaseClient
            .from('schools')
            .select('sector_id, region_id')
            .eq('id', entityId)
            .single()
          
          if (schoolData) {
            roleData.sector_id = schoolData.sector_id
            roleData.region_id = schoolData.region_id
          }
        }
        break
    }

    // Mövcud rolu update və ya yeni rol insert edirik
    if (existingRole) {
      // Update
      const { data, error } = await supabaseClient
        .from('user_roles')
        .update(roleData)
        .eq('user_id', userId)
        .select('*')
      
      if (error) throw new Error(`Role update failed: ${error.message}`)
      result = data
    } else {
      // Insert
      const { data, error } = await supabaseClient
        .from('user_roles')
        .insert(roleData)
        .select('*')
      
      if (error) throw new Error(`Role insert failed: ${error.message}`)
      result = data
    }

    // Profil cədvəlinə də məlumat əlavə edirik
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    // Əgər profil mövcud deyilsə, yaradırıq
    if (!profile) {
      await supabaseClient
        .from('profiles')
        .insert({
          id: userId,
          role: role,
          status: 'active'
        })
    } else {
      // Profili yeniləyirik
      await supabaseClient
        .from('profiles')
        .update({
          role: role,
          status: 'active'
        })
        .eq('id', userId)
    }

    // Audit log-a qeyd əlavə edirik
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: `assign_${role}`,
        entity_type: 'user_role',
        entity_id: userId,
        details: {
          role: role,
          entity_id: entityId,
          assigned_by: user.id
        }
      })

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})


import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import type { ManageEntityParams } from '../_shared/types.ts'

serve(async (req) => {
  // CORS idarəsi
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Giriş parametrləri
    const { action, entityType, data } = await req.json() as ManageEntityParams
    
    // Parametrləri yoxlayırıq
    if (!action || !entityType) {
      return new Response(
        JSON.stringify({
          error: 'action və entityType tələb olunur'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Keçərli əməliyyat və entity tiplərini yoxlayırıq
    const validActions = ['create', 'read', 'update', 'delete']
    const validEntityTypes = ['column', 'region', 'sector', 'school', 'category']

    if (!validActions.includes(action)) {
      return new Response(
        JSON.stringify({ error: `Invalid action: ${action}. Allowed: ${validActions.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!validEntityTypes.includes(entityType)) {
      return new Response(
        JSON.stringify({ error: `Invalid entityType: ${entityType}. Allowed: ${validEntityTypes.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // Əgər user yoxdursa xəta qaytarırıq
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

    // İcazələri yoxlayırıq - entityType və istifadəçi roluna görə
    let hasPermission = false

    if (userRole?.role === 'superadmin') {
      // SuperAdmin bütün entitylər üçün bütün əməliyyatları edə bilər
      hasPermission = true
    } else if (userRole?.role === 'regionadmin') {
      // RegionAdmin yalnız öz regionunda olan entityləri idarə edə bilər
      if (['sector', 'school', 'column', 'category'].includes(entityType)) {
        // Burada əlavə icazə yoxlamaları əlavə oluna bilər
        // Məsələn: gələn data-da region_id userRole.region_id ilə uyğun olmalıdır
        hasPermission = true
      }
    } else if (userRole?.role === 'sectoradmin') {
      // SectorAdmin yalnız öz sektorunda olan məktəbləri idarə edə bilər
      if (['school'].includes(entityType)) {
        // Burada əlavə icazə yoxlamaları əlavə oluna bilər
        hasPermission = true
      }
    }

    // İcazə yoxdursa, xəta qaytarırıq
    if (!hasPermission) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Entity tipinə uyğun cədvəl adını təyin edirik
    const tableMap: Record<string, string> = {
      'column': 'columns',
      'region': 'regions',
      'sector': 'sectors',
      'school': 'schools',
      'category': 'categories'
    }
    
    const tableName = tableMap[entityType]
    let result

    // Əməliyyatı yerinə yetiririk
    switch (action) {
      case 'create':
        const { data: createdData, error: createError } = await supabaseClient
          .from(tableName)
          .insert(data)
          .select()

        if (createError) throw new Error(`Create error: ${createError.message}`)
        result = createdData
        break

      case 'read':
        let query = supabaseClient.from(tableName).select('*')

        // Filtrlər əlavə edilə bilər
        if (data.id) {
          query = query.eq('id', data.id)
        }
        
        if (data.filters) {
          Object.entries(data.filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              query = query.eq(key, value)
            }
          })
        }

        const { data: readData, error: readError } = await query
        if (readError) throw new Error(`Read error: ${readError.message}`)
        result = readData
        break

      case 'update':
        if (!data.id) {
          throw new Error('ID is required for update operation')
        }

        // Update-də ötürülən id-ni ayırırıq
        const { id, ...updateData } = data

        const { data: updatedData, error: updateError } = await supabaseClient
          .from(tableName)
          .update(updateData)
          .eq('id', id)
          .select()

        if (updateError) throw new Error(`Update error: ${updateError.message}`)
        result = updatedData
        break

      case 'delete':
        if (!data.id) {
          throw new Error('ID is required for delete operation')
        }

        const { data: deletedData, error: deleteError } = await supabaseClient
          .from(tableName)
          .delete()
          .eq('id', data.id)
          .select()

        if (deleteError) throw new Error(`Delete error: ${deleteError.message}`)
        result = deletedData
        break

      default:
        throw new Error(`Unsupported action: ${action}`)
    }

    // Audit log-a qeyd əlavə edirik
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: `${action}_${entityType}`,
        entity_type: entityType,
        entity_id: data.id || result?.[0]?.id,
        details: {
          data,
          result
        }
      })

    // Uğur mesajı qaytarırıq
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result,
        message: `${entityType} ${action} operation completed successfully` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

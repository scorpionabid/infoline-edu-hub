
import { handleCors } from '../_shared/middleware.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve((req) => handleCors(req, async (req) => {
  try {
    // Supabase klienti yaradırıq
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // İstifadəçi rolunun yoxlanması
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!roleData) {
      throw new Error('No role found')
    }

    // İstifadəçi siyahısının əldə edilməsi
    let query = supabaseClient
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        status,
        user_roles (
          role,
          region_id,
          sector_id,
          school_id
        )
      `)

    // Region admin-i üçün filter
    if (roleData.role === 'regionadmin') {
      const { data: adminRegion } = await supabaseClient
        .from('user_roles')
        .select('region_id')
        .eq('user_id', user.id)
        .single()

      if (adminRegion?.region_id) {
        query = query.eq('user_roles.region_id', adminRegion.region_id)
      }
    }
    
    // Sektor admin-i üçün filter
    else if (roleData.role === 'sectoradmin') {
      const { data: adminSector } = await supabaseClient
        .from('user_roles')
        .select('sector_id')
        .eq('user_id', user.id)
        .single()

      if (adminSector?.sector_id) {
        query = query.eq('user_roles.sector_id', adminSector.sector_id)
      }
    }

    const { data: users, error: usersError } = await query

    if (usersError) {
      throw usersError
    }

    return new Response(
      JSON.stringify({
        users: users || [],
        totalCount: users?.length || 0
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: error.message === 'Unauthorized' ? 401 : 500,
      },
    )
  }
}));

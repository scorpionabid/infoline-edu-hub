
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface DashboardDataParams {
  role?: string;
  entityId?: string;
}

serve(async (req) => {
  // CORS handling
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request parameters
    const { role, entityId } = await req.json() as DashboardDataParams
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get user information
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Simplified data fetching - delegating detailed logic to client-side hook
    let dashboardData

    switch (role) {
      case 'superadmin':
        dashboardData = await fetchSuperAdminDashboard(supabaseClient)
        break
      case 'regionadmin':
        dashboardData = await fetchRegionAdminDashboard(supabaseClient, entityId)
        break
      case 'sectoradmin':
        dashboardData = await fetchSectorAdminDashboard(supabaseClient, entityId)
        break
      case 'schooladmin':
        dashboardData = await fetchSchoolAdminDashboard(supabaseClient, entityId)
        break
      default:
        throw new Error(`Unsupported role: ${role}`)
    }

    return new Response(
      JSON.stringify(dashboardData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Simplified SuperAdmin dashboard data
async function fetchSuperAdminDashboard(supabase: any) {
  const [regionCount, sectorCount, schoolCount, userCount] = await Promise.all([
    supabase.from('regions').select('id', { count: 'exact' }),
    supabase.from('sectors').select('id', { count: 'exact' }),
    supabase.from('schools').select('id', { count: 'exact' }),
    supabase.from('user_roles').select('user_id', { count: 'exact' })
  ])
  
  return {
    regionCount: regionCount.count || 0,
    sectorCount: sectorCount.count || 0,
    schoolCount: schoolCount.count || 0,
    userCount: userCount.count || 0,
    completionRate: 0,
    approvalRate: 0
  }
}

// Simplified RegionAdmin dashboard data
async function fetchRegionAdminDashboard(supabase: any, regionId?: string) {
  if (!regionId) {
    throw new Error('Region ID is required for RegionAdmin dashboard')
  }
  
  const [sectorCount, schoolCount, userCount] = await Promise.all([
    supabase.from('sectors').select('id', { count: 'exact' }).eq('region_id', regionId),
    supabase.from('schools').select('id', { count: 'exact' }).eq('region_id', regionId),
    supabase.from('user_roles').select('user_id', { count: 'exact' }).eq('region_id', regionId)
  ])
  
  return {
    sectorCount: sectorCount.count || 0,
    schoolCount: schoolCount.count || 0,
    userCount: userCount.count || 0,
    completionRate: 0,
    approvalRate: 0
  }
}

// Simplified SectorAdmin dashboard data
async function fetchSectorAdminDashboard(supabase: any, sectorId?: string) {
  if (!sectorId) {
    throw new Error('Sector ID is required for SectorAdmin dashboard')
  }
  
  const [schoolCount, userCount] = await Promise.all([
    supabase.from('schools').select('id', { count: 'exact' }).eq('sector_id', sectorId),
    supabase.from('user_roles').select('user_id', { count: 'exact' }).eq('sector_id', sectorId)
  ])
  
  return {
    schoolCount: schoolCount.count || 0,
    userCount: userCount.count || 0,
    completionRate: 0,
    approvalRate: 0
  }
}

// Simplified SchoolAdmin dashboard data
async function fetchSchoolAdminDashboard(supabase: any, schoolId?: string) {
  if (!schoolId) {
    throw new Error('School ID is required for SchoolAdmin dashboard')
  }
  
  const { data: entriesStats } = await supabase
    .from('data_entries')
    .select('status')
    .eq('school_id', schoolId)
  
  const formStats = {
    approved: 0,
    pending: 0,
    rejected: 0,
    incomplete: 0
  }
  
  if (entriesStats) {
    entriesStats.forEach((entry: any) => {
      switch (entry.status) {
        case 'approved':
          formStats.approved++
          break
        case 'pending':
          formStats.pending++
          break
        case 'rejected':
          formStats.rejected++
          break
        case 'draft':
          formStats.incomplete++
          break
      }
    })
  }
  
  return {
    formStats,
    completionRate: 0
  }
}


import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import type { DashboardDataParams } from '../_shared/types.ts'

serve(async (req) => {
  // CORS idarəsi
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Giriş parametrləri
    const { role, entityId } = await req.json() as DashboardDataParams
    
    // Parametrləri yoxlayırıq
    if (!role) {
      return new Response(
        JSON.stringify({
          error: 'role tələb olunur'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Client yaradırıq
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // İstifadəçi məlumatlarını əldə edirik
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

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

    // İstifadəçinin göstərilən rol ilə tələb olunan rol arasında uyğunluğu yoxlayırıq
    if (!userRole || userRole.role !== role) {
      return new Response(
        JSON.stringify({ error: 'Role mismatch or insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Rol tipinə görə müvafiq dashboard məlumatlarını əldə edirik
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

// SuperAdmin dashboard məlumatları
async function fetchSuperAdminDashboard(supabase) {
  // Mock data - real data əvəzinə
  const regionCountPromise = supabase.from('regions').select('id', { count: 'exact' })
  const sectorCountPromise = supabase.from('sectors').select('id', { count: 'exact' })
  const schoolCountPromise = supabase.from('schools').select('id', { count: 'exact' })
  const userCountPromise = supabase.from('user_roles').select('user_id', { count: 'exact' })
  
  const [regionCount, sectorCount, schoolCount, userCount] = await Promise.all([
    regionCountPromise, 
    sectorCountPromise, 
    schoolCountPromise, 
    userCountPromise
  ])
  
  return {
    regionCount: regionCount.count || 0,
    sectorCount: sectorCount.count || 0,
    schoolCount: schoolCount.count || 0,
    userCount: userCount.count || 0,
    completionRate: 0, // Hesablana bilər
    approvalRate: 0, // Hesablana bilər
    recentCategories: [],
    recentSchools: [],
    notifications: []
  }
}

// RegionAdmin dashboard məlumatları
async function fetchRegionAdminDashboard(supabase, regionId) {
  if (!regionId) {
    throw new Error('Region ID is required for RegionAdmin dashboard')
  }
  
  const sectorCountPromise = supabase
    .from('sectors')
    .select('id', { count: 'exact' })
    .eq('region_id', regionId)
  
  const schoolCountPromise = supabase
    .from('schools')
    .select('id', { count: 'exact' })
    .eq('region_id', regionId)
  
  const userCountPromise = supabase
    .from('user_roles')
    .select('user_id', { count: 'exact' })
    .eq('region_id', regionId)
  
  const [sectorCount, schoolCount, userCount] = await Promise.all([
    sectorCountPromise, 
    schoolCountPromise, 
    userCountPromise
  ])
  
  return {
    sectorCount: sectorCount.count || 0,
    schoolCount: schoolCount.count || 0,
    userCount: userCount.count || 0,
    completionRate: 0, // Hesablana bilər
    approvalRate: 0, // Hesablana bilər
    recentCategories: [],
    recentSchools: [],
    notifications: []
  }
}

// SectorAdmin dashboard məlumatları
async function fetchSectorAdminDashboard(supabase, sectorId) {
  if (!sectorId) {
    throw new Error('Sector ID is required for SectorAdmin dashboard')
  }
  
  const schoolCountPromise = supabase
    .from('schools')
    .select('id', { count: 'exact' })
    .eq('sector_id', sectorId)
  
  const userCountPromise = supabase
    .from('user_roles')
    .select('user_id', { count: 'exact' })
    .eq('sector_id', sectorId)
  
  const [schoolCount, userCount] = await Promise.all([
    schoolCountPromise, 
    userCountPromise
  ])
  
  return {
    schoolCount: schoolCount.count || 0,
    userCount: userCount.count || 0,
    completionRate: 0, // Hesablana bilər
    approvalRate: 0, // Hesablana bilər
    recentCategories: [],
    recentSchools: [],
    pendingApprovals: [],
    notifications: []
  }
}

// SchoolAdmin dashboard məlumatları
async function fetchSchoolAdminDashboard(supabase, schoolId) {
  if (!schoolId) {
    throw new Error('School ID is required for SchoolAdmin dashboard')
  }
  
  // Data entries statistikasını çəkirik
  const { data: entriesStats, error: entriesError } = await supabase
    .from('data_entries')
    .select('status, count')
    .eq('school_id', schoolId)
    .group('status')
  
  // Tamamlanma dərəcəsini hesablayırıq
  const { data: completionData } = await supabase
    .rpc('calculate_completion_rate', { school_id_param: schoolId })
  
  const formStats = {
    approved: 0,
    pending: 0,
    rejected: 0,
    incomplete: 0
  }
  
  if (entriesStats) {
    entriesStats.forEach(item => {
      switch (item.status) {
        case 'approved':
          formStats.approved = item.count
          break
        case 'pending':
          formStats.pending = item.count
          break
        case 'rejected':
          formStats.rejected = item.count
          break
        case 'draft':
          formStats.incomplete = item.count
          break
      }
    })
  }
  
  return {
    formStats,
    completionRate: completionData?.[0]?.completion_rate || 0,
    recentCategories: [],
    upcomingDeadlines: [],
    notifications: []
  }
}

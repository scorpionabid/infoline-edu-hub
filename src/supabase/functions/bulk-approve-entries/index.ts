
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { entries, comment } = await req.json()

    console.log(`Processing bulk approval for ${entries.length} entries by user ${user.id}`)

    // Get user role for permission checking
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role, region_id, sector_id, school_id')
      .eq('user_id', user.id)
      .single()

    if (roleError) {
      throw new Error('Unable to verify user permissions')
    }

    console.log('User role:', userRole)

    // Process each entry with permission checks
    const results = []
    
    for (const entry of entries) {
      try {
        // Check permissions based on entry type
        if (entry.type === 'school') {
          const [categoryId, schoolId] = entry.id.split('-')
          
          // Get school info for permission check
          const { data: school, error: schoolError } = await supabase
            .from('schools')
            .select('region_id, sector_id')
            .eq('id', schoolId)
            .single()

          if (schoolError) {
            throw new Error(`School not found: ${schoolId}`)
          }

          // Check if user has permission to approve this school's data
          let hasPermission = false
          if (userRole.role === 'superadmin') {
            hasPermission = true
          } else if (userRole.role === 'regionadmin' && school.region_id === userRole.region_id) {
            hasPermission = true
          } else if (userRole.role === 'sectoradmin' && school.sector_id === userRole.sector_id) {
            hasPermission = true
          }

          if (!hasPermission) {
            results.push({
              id: entry.id,
              success: false,
              error: 'No permission to approve this entry'
            })
            continue
          }

          // Approve all entries for this school-category combination
          const { error: updateError } = await supabase
            .from('data_entries')
            .update({
              status: 'approved',
              approved_at: new Date().toISOString(),
              approved_by: user.id,
              approval_comment: comment
            })
            .eq('category_id', categoryId)
            .eq('school_id', schoolId)
            .eq('status', 'pending')

          if (updateError) {
            throw new Error(`Failed to approve entries: ${updateError.message}`)
          }

          results.push({
            id: entry.id,
            success: true,
            message: 'School entries approved successfully'
          })

        } else if (entry.type === 'sector') {
          const [categoryId, sectorId] = entry.id.split('-')
          
          // Get sector info for permission check
          const { data: sector, error: sectorError } = await supabase
            .from('sectors')
            .select('region_id')
            .eq('id', sectorId)
            .single()

          if (sectorError) {
            throw new Error(`Sector not found: ${sectorId}`)
          }

          // Check permissions for sector data
          let hasPermission = false
          if (userRole.role === 'superadmin') {
            hasPermission = true
          } else if (userRole.role === 'regionadmin' && sector.region_id === userRole.region_id) {
            hasPermission = true
          }

          if (!hasPermission) {
            results.push({
              id: entry.id,
              success: false,
              error: 'No permission to approve this sector entry'
            })
            continue
          }

          // Approve sector data entries
          const { error: updateError } = await supabase
            .from('sector_data_entries')
            .update({
              status: 'approved',
              approved_at: new Date().toISOString(),
              approved_by: user.id,
              approval_comment: comment
            })
            .eq('category_id', categoryId)
            .eq('sector_id', sectorId)
            .eq('status', 'pending')

          if (updateError) {
            throw new Error(`Failed to approve sector entries: ${updateError.message}`)
          }

          results.push({
            id: entry.id,
            success: true,
            message: 'Sector entries approved successfully'
          })
        }

      } catch (error) {
        console.error(`Error processing entry ${entry.id}:`, error)
        results.push({
          id: entry.id,
          success: false,
          error: error.message
        })
      }
    }

    // Create audit log entry
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'bulk_approve',
        entity_type: 'data_entries',
        entity_id: null,
        new_value: {
          approved_count: results.filter(r => r.success).length,
          failed_count: results.filter(r => !r.success).length,
          comment: comment
        }
      })

    console.log('Bulk approval completed:', {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    })

    return new Response(
      JSON.stringify({
        success: true,
        results: results,
        summary: {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Bulk approval error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

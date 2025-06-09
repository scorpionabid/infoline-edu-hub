import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EnhancedDeleteRequest {
  columnId: string;
  hardDelete?: boolean;
  exportData?: boolean;
  confirmation?: string;
}

interface DeleteResult {
  success: boolean;
  deletionType: 'soft' | 'permanent';
  deletedRecords: {
    dataEntries: number;
    sectorEntries: number;
  };
  exportUrl?: string;
  restorationDeadline?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Enhanced delete column function started')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '', // Use anon key instead of service role
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    console.log('🔐 Supabase client created')

    // Verify user authentication and permissions
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      console.error('❌ Auth error:', authError)
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized',
          details: authError?.message 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ User authenticated:', user.id)

    // Check user permissions
    const { data: userRole, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role, region_id')
      .eq('user_id', user.id)
      .single()

    if (roleError) {
      console.error('❌ Role error:', roleError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get user role',
          details: roleError.message 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!userRole || !['superadmin', 'regionadmin'].includes(userRole.role)) {
      console.log('❌ Insufficient permissions:', userRole?.role)
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions to delete columns' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ User role verified:', userRole.role)

    const { columnId, hardDelete = false, exportData = false, confirmation }: EnhancedDeleteRequest = await req.json()

    if (!columnId) {
      return new Response(
        JSON.stringify({ error: 'Column ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('📝 Processing column deletion:', { columnId, hardDelete, exportData })

    // Get column details first
    const { data: column, error: columnError } = await supabaseClient
      .from('columns')
      .select('id, name, type, status, category_id')
      .eq('id', columnId)
      .single()

    if (columnError || !column) {
      console.error('❌ Column not found:', columnError)
      return new Response(
        JSON.stringify({ 
          error: 'Column not found',
          details: columnError?.message 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Column found:', column.name)

    // Additional safety check for hard delete (only superadmin)
    if (hardDelete && userRole.role !== 'superadmin') {
      return new Response(
        JSON.stringify({ error: 'Hard delete is only allowed for superadmin' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate confirmation text
    const expectedConfirmation = `DELETE ${column.name}`
    if (confirmation !== expectedConfirmation) {
      console.log('❌ Invalid confirmation:', { received: confirmation, expected: expectedConfirmation })
      return new Response(
        JSON.stringify({ 
          error: 'Invalid confirmation text',
          expected: expectedConfirmation 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Count records that will be affected
    console.log('📊 Counting affected records...')
    
    const [dataEntriesResult, sectorEntriesResult] = await Promise.all([
      supabaseClient
        .from('data_entries')
        .select('id', { count: 'exact' })
        .eq('column_id', columnId),
      supabaseClient
        .from('sector_data_entries')
        .select('id', { count: 'exact' })
        .eq('column_id', columnId)
    ])

    const dataEntriesCount = dataEntriesResult.count || 0
    const sectorEntriesCount = sectorEntriesResult.count || 0

    console.log('📊 Affected records:', { dataEntriesCount, sectorEntriesCount })

    let exportUrl: string | undefined

    // Perform the deletion
    const currentTime = new Date().toISOString()
    let deletionResult: DeleteResult

    if (hardDelete) {
      console.log('🗑️ Performing HARD DELETE...')
      try {
        // Delete in correct order (foreign key constraints)
        if (dataEntriesCount > 0) {
          await supabaseClient
            .from('data_entries')
            .delete()
            .eq('column_id', columnId)
        }

        if (sectorEntriesCount > 0) {
          await supabaseClient
            .from('sector_data_entries')
            .delete()
            .eq('column_id', columnId)
        }

        await supabaseClient
          .from('columns')
          .delete()
          .eq('id', columnId)

        deletionResult = {
          success: true,
          deletionType: 'permanent',
          deletedRecords: {
            dataEntries: dataEntriesCount,
            sectorEntries: sectorEntriesCount
          },
          exportUrl
        }
        
        console.log('✅ Hard delete completed')
      } catch (deleteError) {
        console.error('❌ Hard delete failed:', deleteError)
        throw new Error(`Hard delete failed: ${deleteError.message}`)
      }
    } else {
      console.log('🗑️ Performing SOFT DELETE...')
      const restorationDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days

      try {
        // Mark column as deleted (simple soft delete)
        const { error: updateError } = await supabaseClient
          .from('columns')
          .update({ 
            status: 'deleted'
          })
          .eq('id', columnId)

        if (updateError) {
          console.error('❌ Failed to update column status:', updateError)
          throw updateError
        }

        deletionResult = {
          success: true,
          deletionType: 'soft',
          deletedRecords: {
            dataEntries: dataEntriesCount,
            sectorEntries: sectorEntriesCount
          },
          exportUrl,
          restorationDeadline
        }
        
        console.log('✅ Soft delete completed')
      } catch (deleteError) {
        console.error('❌ Soft delete failed:', deleteError)
        throw new Error(`Soft delete failed: ${deleteError.message}`)
      }
    }

    // Try to create audit log (optional - don't fail if this fails)
    try {
      await supabaseClient
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: hardDelete ? 'HARD_DELETE_COLUMN' : 'SOFT_DELETE_COLUMN',
          entity_type: 'columns',
          entity_id: columnId,
          old_value: {
            column_name: column.name,
            column_type: column.type,
            category_id: column.category_id,
            deleted_records: {
              data_entries: dataEntriesCount,
              sector_entries: sectorEntriesCount
            },
            export_requested: exportData,
            export_url: exportUrl
          },
          new_value: {
            deletion_type: hardDelete ? 'permanent' : 'soft',
            restoration_deadline: deletionResult.restorationDeadline,
            performed_at: currentTime
          }
        })
      
      console.log('✅ Audit log created')
    } catch (auditError) {
      console.warn('⚠️ Failed to create audit log:', auditError)
      // Don't fail the entire operation for audit log failure
    }

    console.log('🎉 Operation completed successfully')
    
    return new Response(
      JSON.stringify(deletionResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 Error in enhanced-delete-column function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
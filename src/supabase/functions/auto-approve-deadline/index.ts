
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting deadline auto-approval process...')

    // Get categories that have passed their deadline
    const { data: expiredCategories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, deadline')
      .not('deadline', 'is', null)
      .lt('deadline', new Date().toISOString())

    if (categoriesError) {
      throw new Error(`Failed to get expired categories: ${categoriesError.message}`)
    }

    console.log(`Found ${expiredCategories?.length || 0} expired categories`)

    if (!expiredCategories || expiredCategories.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No expired categories found',
          processedCategories: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    const results = []

    for (const category of expiredCategories) {
      try {
        console.log(`Processing category: ${category.name} (ID: ${category.id})`)

        // Auto-approve pending school data entries for this category
        const { data: schoolEntries, error: schoolUpdateError } = await supabase
          .from('data_entries')
          .update({
            status: 'approved',
            approved_at: new Date().toISOString(),
            approved_by: null, // System approval
            approval_comment: `Auto-approved due to deadline expiry on ${category.deadline}`
          })
          .eq('category_id', category.id)
          .eq('status', 'pending')
          .select('id, school_id')

        if (schoolUpdateError) {
          throw new Error(`Failed to auto-approve school entries: ${schoolUpdateError.message}`)
        }

        // Auto-approve pending sector data entries for this category
        const { data: sectorEntries, error: sectorUpdateError } = await supabase
          .from('sector_data_entries')
          .update({
            status: 'approved',
            approved_at: new Date().toISOString(),
            approved_by: null, // System approval
            approval_comment: `Auto-approved due to deadline expiry on ${category.deadline}`
          })
          .eq('category_id', category.id)
          .eq('status', 'pending')
          .select('id, sector_id')

        if (sectorUpdateError) {
          throw new Error(`Failed to auto-approve sector entries: ${sectorUpdateError.message}`)
        }

        const schoolCount = schoolEntries?.length || 0
        const sectorCount = sectorEntries?.length || 0

        console.log(`Auto-approved ${schoolCount} school entries and ${sectorCount} sector entries for category ${category.name}`)

        // Create audit log
        await supabase
          .from('audit_logs')
          .insert({
            user_id: null, // System action
            action: 'auto_approve_deadline',
            entity_type: 'category',
            entity_id: category.id,
            new_value: {
              category_name: category.name,
              deadline: category.deadline,
              school_entries_approved: schoolCount,
              sector_entries_approved: sectorCount,
              auto_approved_at: new Date().toISOString()
            }
          })

        results.push({
          category_id: category.id,
          category_name: category.name,
          deadline: category.deadline,
          school_entries_approved: schoolCount,
          sector_entries_approved: sectorCount,
          success: true
        })

      } catch (error) {
        console.error(`Error processing category ${category.id}:`, error)
        results.push({
          category_id: category.id,
          category_name: category.name,
          success: false,
          error: error.message
        })
      }
    }

    const totalSchoolApprovals = results.reduce((sum, r) => sum + (r.school_entries_approved || 0), 0)
    const totalSectorApprovals = results.reduce((sum, r) => sum + (r.sector_entries_approved || 0), 0)

    console.log('Auto-approval process completed:', {
      categories_processed: results.length,
      total_school_approvals: totalSchoolApprovals,
      total_sector_approvals: totalSectorApprovals
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Auto-approval process completed',
        results: results,
        summary: {
          categories_processed: results.length,
          total_school_approvals: totalSchoolApprovals,
          total_sector_approvals: totalSectorApprovals,
          successful_categories: results.filter(r => r.success).length,
          failed_categories: results.filter(r => !r.success).length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Auto-approval error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

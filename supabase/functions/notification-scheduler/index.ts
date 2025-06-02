import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ScheduledJob {
  id: string
  name: string
  schedule: string
  function_name: string
  enabled: boolean
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Running scheduled notification jobs...')

    const jobs: ScheduledJob[] = [
      {
        id: 'deadline-check',
        name: 'Deadline Notifications Check',
        schedule: '0 9 * * *', // Daily at 9 AM
        function_name: 'deadline-checker',
        enabled: true
      },
      {
        id: 'process-scheduled-notifications',
        name: 'Process Scheduled Notifications',
        schedule: '*/15 * * * *', // Every 15 minutes
        function_name: 'process-scheduled-notifications',
        enabled: true
      },
      {
        id: 'cleanup-old-notifications',
        name: 'Clean Old Notifications',
        schedule: '0 2 * * 0', // Weekly on Sunday at 2 AM
        function_name: 'cleanup-notifications',
        enabled: true
      }
    ]

    const results = []

    for (const job of jobs) {
      if (!job.enabled) {
        console.log(`Skipping disabled job: ${job.name}`)
        continue
      }

      try {
        console.log(`Executing job: ${job.name}`)
        
        if (job.function_name === 'deadline-checker') {
          // Call deadline checker function
          const { data, error } = await supabaseClient.functions.invoke('deadline-checker')
          
          if (error) {
            throw new Error(`Deadline checker error: ${error.message}`)
          }

          results.push({
            job: job.name,
            status: 'success',
            result: data,
            timestamp: new Date().toISOString()
          })

        } else if (job.function_name === 'process-scheduled-notifications') {
          // Process scheduled notifications
          const result = await processScheduledNotifications(supabaseClient)
          
          results.push({
            job: job.name,
            status: 'success',
            result: result,
            timestamp: new Date().toISOString()
          })

        } else if (job.function_name === 'cleanup-notifications') {
          // Clean up old notifications
          const result = await cleanupOldNotifications(supabaseClient)
          
          results.push({
            job: job.name,
            status: 'success', 
            result: result,
            timestamp: new Date().toISOString()
          })
        }

      } catch (error) {
        console.error(`Error executing job ${job.name}:`, error)
        results.push({
          job: job.name,
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        })
      }
    }

    // Log job execution
    const { error: logError } = await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: null, // System job
        action: 'scheduled_jobs_execution',
        entity_type: 'system',
        entity_id: null,
        new_value: {
          jobs_executed: results.length,
          successful: results.filter(r => r.status === 'success').length,
          failed: results.filter(r => r.status === 'error').length,
          results: results
        }
      })

    if (logError) {
      console.error('Error logging job execution:', logError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Scheduled jobs completed',
        executedJobs: results.length,
        results: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Scheduled jobs error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

/**
 * Process scheduled notifications that are due
 */
async function processScheduledNotifications(supabaseClient: any): Promise<any> {
  try {
    // Get notifications scheduled for now or earlier
    const { data: scheduledNotifications, error } = await supabaseClient
      .from('scheduled_notifications')
      .select(`
        *,
        notification_templates (
          name,
          title_template,
          message_template,
          type,
          priority
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())

    if (error) {
      throw new Error(`Error fetching scheduled notifications: ${error.message}`)
    }

    if (!scheduledNotifications || scheduledNotifications.length === 0) {
      return { processed: 0, message: 'No scheduled notifications to process' }
    }

    let processed = 0
    let failed = 0

    for (const scheduled of scheduledNotifications) {
      try {
        // Determine recipients
        const recipients = await getRecipientsFromCriteria(supabaseClient, scheduled.recipients)

        if (recipients.length === 0) {
          console.log(`No recipients found for scheduled notification ${scheduled.id}`)
          continue
        }

        // Create notifications for each recipient
        const notifications = []
        for (const recipient of recipients) {
          const personalizedData = {
            ...scheduled.template_data,
            full_name: recipient.full_name,
            email: recipient.email
          }

          const renderedTitle = renderTemplate(scheduled.notification_templates.title_template, personalizedData)
          const renderedMessage = renderTemplate(scheduled.notification_templates.message_template, personalizedData)

          notifications.push({
            user_id: recipient.id,
            title: renderedTitle,
            message: renderedMessage,
            type: scheduled.notification_templates.type,
            priority: scheduled.notification_templates.priority,
            template_id: scheduled.template_id,
            template_data: personalizedData,
            is_read: false,
            created_at: new Date().toISOString()
          })
        }

        // Insert notifications
        const { error: insertError } = await supabaseClient
          .from('notifications')
          .insert(notifications)

        if (insertError) {
          throw new Error(`Error creating notifications: ${insertError.message}`)
        }

        // Mark scheduled notification as sent
        const { error: updateError } = await supabaseClient
          .from('scheduled_notifications')
          .update({
            status: 'sent',
            processed_at: new Date().toISOString()
          })
          .eq('id', scheduled.id)

        if (updateError) {
          console.error(`Error updating scheduled notification status: ${updateError.message}`)
        }

        processed++

      } catch (notificationError) {
        console.error(`Error processing scheduled notification ${scheduled.id}:`, notificationError)
        
        // Mark as failed
        await supabaseClient
          .from('scheduled_notifications')
          .update({
            status: 'failed',
            processed_at: new Date().toISOString()
          })
          .eq('id', scheduled.id)

        failed++
      }
    }

    return {
      processed,
      failed,
      total: scheduledNotifications.length,
      message: `Processed ${processed} scheduled notifications, ${failed} failed`
    }

  } catch (error) {
    console.error('Error in processScheduledNotifications:', error)
    throw error
  }
}

/**
 * Clean up old notifications
 */
async function cleanupOldNotifications(supabaseClient: any): Promise<any> {
  try {
    // Clean notifications older than 90 days that are read
    const { data, error } = await supabaseClient
      .rpc('cleanup_old_notifications', { p_days_old: 90 })

    if (error) {
      throw new Error(`Error cleaning notifications: ${error.message}`)
    }

    return {
      deleted: data,
      message: `Cleaned up ${data} old notifications`
    }

  } catch (error) {
    console.error('Error in cleanupOldNotifications:', error)
    throw error
  }
}

/**
 * Get recipients based on criteria
 */
async function getRecipientsFromCriteria(supabaseClient: any, criteria: any): Promise<any[]> {
  try {
    const recipients = []

    if (Array.isArray(criteria)) {
      for (const criterion of criteria) {
        if (criterion === 'all_school_admins') {
          // Get all school admins
          const { data: schoolAdmins } = await supabaseClient
            .from('user_roles')
            .select(`
              user_id,
              profiles:user_id (
                id,
                full_name,
                email
              )
            `)
            .eq('role', 'schooladmin')

          if (schoolAdmins) {
            recipients.push(...schoolAdmins
              .filter((admin: any) => admin.profiles)
              .map((admin: any) => admin.profiles)
            )
          }

        } else if (criterion === 'all_sector_admins') {
          // Get all sector admins
          const { data: sectorAdmins } = await supabaseClient
            .from('user_roles')
            .select(`
              user_id,
              profiles:user_id (
                id,
                full_name,
                email
              )
            `)
            .eq('role', 'sectoradmin')

          if (sectorAdmins) {
            recipients.push(...sectorAdmins
              .filter((admin: any) => admin.profiles)
              .map((admin: any) => admin.profiles)
            )
          }

        } else if (criterion === 'all_region_admins') {
          // Get all region admins
          const { data: regionAdmins } = await supabaseClient
            .from('user_roles')
            .select(`
              user_id,
              profiles:user_id (
                id,
                full_name,
                email
              )
            `)
            .eq('role', 'regionadmin')

          if (regionAdmins) {
            recipients.push(...regionAdmins
              .filter((admin: any) => admin.profiles)
              .map((admin: any) => admin.profiles)
            )
          }
        }
      }
    }

    // Remove duplicates
    const uniqueRecipients = recipients.filter((recipient, index, self) =>
      index === self.findIndex(r => r.id === recipient.id)
    )

    return uniqueRecipients

  } catch (error) {
    console.error('Error getting recipients from criteria:', error)
    return []
  }
}

/**
 * Render template with data substitution
 */
function renderTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match
  })
}

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeadlineCheckResult {
  processed: number
  warnings3Days: number
  warnings1Day: number
  expired: number
  errors: string[]
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

    console.log('Starting deadline check job...')

    const result: DeadlineCheckResult = {
      processed: 0,
      warnings3Days: 0,
      warnings1Day: 0,
      expired: 0,
      errors: []
    }

    // Get all active categories with deadlines
    const { data: categories, error: categoriesError } = await supabaseClient
      .from('categories')
      .select('*')
      .not('deadline', 'is', null)
      .eq('status', 'active')

    if (categoriesError) {
      result.errors.push(`Categories fetch error: ${categoriesError.message}`)
      return createResponse(result, 400)
    }

    if (!categories || categories.length === 0) {
      console.log('No categories with deadlines found')
      return createResponse(result, 200)
    }

    const now = new Date()
    const today = now.toISOString().split('T')[0]

    // Process each category
    for (const category of categories) {
      try {
        const deadline = new Date(category.deadline)
        const timeDiff = deadline.getTime() - now.getTime()
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

        console.log(`Processing category: ${category.name}, days left: ${daysDiff}`)

        // Check what type of notification to send
        if (daysDiff === 3) {
          await sendDeadlineWarning(supabaseClient, category, '3_days', today, result)
          result.warnings3Days++
        } else if (daysDiff === 1) {
          await sendDeadlineWarning(supabaseClient, category, '1_day', today, result)
          result.warnings1Day++
        } else if (daysDiff <= 0) {
          await handleExpiredDeadline(supabaseClient, category, today, result)
          result.expired++
        }

        result.processed++
      } catch (error) {
        result.errors.push(`Error processing category ${category.name}: ${error.message}`)
      }
    }

    const message = `Deadline check completed. Processed: ${result.processed}, ` +
      `3-day warnings: ${result.warnings3Days}, ` +
      `1-day warnings: ${result.warnings1Day}, ` +
      `Expired: ${result.expired}, ` +
      `Errors: ${result.errors.length}`

    console.log(message)

    return createResponse(result, 200)

  } catch (error) {
    console.error('Deadline check job failed:', error)
    return createResponse({
      processed: 0,
      warnings3Days: 0,
      warnings1Day: 0,
      expired: 0,
      errors: [error.message]
    }, 500)
  }
})

/**
 * Send deadline warning notifications
 */
async function sendDeadlineWarning(
  supabaseClient: any,
  category: any,
  warningType: '3_days' | '1_day',
  today: string,
  result: DeadlineCheckResult
): Promise<void> {
  try {
    // Check if we've already sent this warning today
    const { data: existingNotifications } = await supabaseClient
      .from('notifications')
      .select('id')
      .eq('related_entity_id', category.id)
      .eq('type', 'warning')
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`)
      .limit(1)

    if (existingNotifications && existingNotifications.length > 0) {
      console.log(`Warning already sent today for category ${category.name}`)
      return
    }

    // Get recipients for this category
    const recipients = await getNotificationRecipients(supabaseClient, category)

    if (recipients.length === 0) {
      result.errors.push(`No recipients found for category ${category.name}`)
      return
    }

    // Get the appropriate template
    const templateName = warningType === '3_days' ? 'deadline_warning_3_days' : 'deadline_warning_1_day'
    
    const { data: template, error: templateError } = await supabaseClient
      .from('notification_templates')
      .select('*')
      .eq('name', templateName)
      .eq('is_active', true)
      .single()

    if (templateError || !template) {
      result.errors.push(`Template not found: ${templateName}`)
      return
    }

    // Prepare template data
    const templateData = {
      category_id: category.id,
      category_name: category.name,
      deadline_date: new Date(category.deadline).toLocaleDateString('az-AZ'),
      days_left: warningType === '3_days' ? 3 : 1,
      data_entry_url: `${Deno.env.get('FRONTEND_URL') || 'https://infoline.edu.az'}/data-entry/${category.id}`
    }

    // Create notifications for each recipient
    const notifications = []
    for (const recipient of recipients) {
      const personalizedData = {
        ...templateData,
        full_name: recipient.full_name,
        email: recipient.email
      }

      const renderedTitle = renderTemplate(template.title_template, personalizedData)
      const renderedMessage = renderTemplate(template.message_template, personalizedData)

      notifications.push({
        user_id: recipient.id,
        title: renderedTitle,
        message: renderedMessage,
        type: template.type,
        priority: template.priority,
        related_entity_id: category.id,
        related_entity_type: 'category',
        template_id: template.id,
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
      result.errors.push(`Failed to create notifications: ${insertError.message}`)
      return
    }

    // Send email notifications
    await sendEmailNotifications(supabaseClient, recipients, template, templateData)

    console.log(`Sent ${warningType} deadline warning for category: ${category.name} to ${recipients.length} recipients`)

  } catch (error) {
    result.errors.push(`Error sending ${warningType} warning: ${error.message}`)
  }
}

/**
 * Handle expired deadline
 */
async function handleExpiredDeadline(
  supabaseClient: any,
  category: any,
  today: string,
  result: DeadlineCheckResult
): Promise<void> {
  try {
    // Check if we've already handled this expiration
    const { data: existingNotifications } = await supabaseClient
      .from('notifications')
      .select('id')
      .eq('related_entity_id', category.id)
      .eq('type', 'error')
      .gte('created_at', `${today}T00:00:00Z`)
      .limit(1)

    if (existingNotifications && existingNotifications.length > 0) {
      console.log(`Expiration already handled for category ${category.name}`)
      return
    }

    // Get recipients
    const recipients = await getNotificationRecipients(supabaseClient, category)

    if (recipients.length > 0) {
      // Get expired template
      const { data: template } = await supabaseClient
        .from('notification_templates')
        .select('*')
        .eq('name', 'deadline_expired')
        .eq('is_active', true)
        .single()

      if (template) {
        // Send expiration notifications
        const templateData = {
          category_id: category.id,
          category_name: category.name,
          deadline_date: new Date(category.deadline).toLocaleDateString('az-AZ')
        }

        const notifications = []
        for (const recipient of recipients) {
          const personalizedData = {
            ...templateData,
            full_name: recipient.full_name,
            email: recipient.email
          }

          const renderedTitle = renderTemplate(template.title_template, personalizedData)
          const renderedMessage = renderTemplate(template.message_template, personalizedData)

          notifications.push({
            user_id: recipient.id,
            title: renderedTitle,
            message: renderedMessage,
            type: template.type,
            priority: template.priority,
            related_entity_id: category.id,
            related_entity_type: 'category',
            template_id: template.id,
            template_data: personalizedData,
            is_read: false,
            created_at: new Date().toISOString()
          })
        }

        await supabaseClient.from('notifications').insert(notifications)
        await sendEmailNotifications(supabaseClient, recipients, template, templateData)
      }
    }

    // Auto-approve pending data entries
    await autoApprovePendingEntries(supabaseClient, category.id)

    console.log(`Handled expired deadline for category: ${category.name}`)

  } catch (error) {
    result.errors.push(`Error handling expired deadline: ${error.message}`)
  }
}

/**
 * Get notification recipients for a category
 */
async function getNotificationRecipients(supabaseClient: any, category: any): Promise<any[]> {
  try {
    const recipients: any[] = []

    if (category.assignment === 'all') {
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
          .map((admin: any) => ({
            id: admin.profiles.id,
            full_name: admin.profiles.full_name,
            email: admin.profiles.email
          }))
        )
      }
    } else if (category.assignment === 'sectors') {
      // Get sector and region admins
      const { data: adminUsers } = await supabaseClient
        .from('user_roles')
        .select(`
          user_id,
          role,
          profiles:user_id (
            id,
            full_name,
            email
          )
        `)
        .in('role', ['sectoradmin', 'regionadmin'])

      if (adminUsers) {
        recipients.push(...adminUsers
          .filter((admin: any) => admin.profiles)
          .map((admin: any) => ({
            id: admin.profiles.id,
            full_name: admin.profiles.full_name,
            email: admin.profiles.email
          }))
        )
      }
    }

    // Remove duplicates
    const uniqueRecipients = recipients.filter((recipient, index, self) =>
      index === self.findIndex(r => r.id === recipient.id)
    )

    return uniqueRecipients
  } catch (error) {
    console.error('Error getting notification recipients:', error)
    return []
  }
}

/**
 * Send email notifications to recipients
 */
async function sendEmailNotifications(
  supabaseClient: any,
  recipients: any[],
  template: any,
  templateData: any
): Promise<void> {
  try {
    // Check if email service is configured
    const emailServiceUrl = Deno.env.get('EMAIL_SERVICE_URL')
    const emailServiceApiKey = Deno.env.get('EMAIL_SERVICE_API_KEY')

    if (!emailServiceUrl || !emailServiceApiKey) {
      console.log('Email service not configured, skipping email notifications')
      return
    }

    // Send emails to recipients who have email enabled
    for (const recipient of recipients) {
      try {
        // Check user preferences
        const { data: preferences } = await supabaseClient
          .from('user_notification_preferences')
          .select('email_enabled')
          .eq('user_id', recipient.id)
          .single()

        // Skip if email is disabled for this user
        if (preferences && !preferences.email_enabled) {
          continue
        }

        // Call send-template-email function
        const { error: emailError } = await supabaseClient.functions.invoke('send-template-email', {
          body: {
            templateName: template.name,
            templateData: {
              ...templateData,
              full_name: recipient.full_name,
              email: recipient.email
            },
            recipients: [recipient.id]
          }
        })

        if (emailError) {
          console.error(`Error sending email to ${recipient.email}:`, emailError)
        }
      } catch (userError) {
        console.error(`Error processing email for user ${recipient.id}:`, userError)
      }
    }
  } catch (error) {
    console.error('Error sending email notifications:', error)
  }
}

/**
 * Auto-approve pending data entries when deadline expires
 */
async function autoApprovePendingEntries(supabaseClient: any, categoryId: string): Promise<void> {
  try {
    // Get all pending data entries for this category
    const { data: pendingEntries, error } = await supabaseClient
      .from('data_entries')
      .select('id, school_id')
      .eq('category_id', categoryId)
      .eq('status', 'pending')

    if (error) {
      console.error('Error fetching pending entries:', error)
      return
    }

    if (!pendingEntries || pendingEntries.length === 0) {
      return
    }

    // Update all pending entries to approved
    const { error: updateError } = await supabaseClient
      .from('data_entries')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: null, // System approval
        updated_at: new Date().toISOString()
      })
      .eq('category_id', categoryId)
      .eq('status', 'pending')

    if (updateError) {
      console.error('Error auto-approving entries:', updateError)
      return
    }

    console.log(`Auto-approved ${pendingEntries.length} pending entries for category ${categoryId}`)
  } catch (error) {
    console.error('Error in autoApprovePendingEntries:', error)
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

/**
 * Create standardized response
 */
function createResponse(data: any, status: number): Response {
  return new Response(
    JSON.stringify(data),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status
    }
  )
}

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TemplateEmailRequest {
  templateId?: string
  templateName?: string
  templateData: Record<string, any>
  recipients: string[]
  fromName?: string
  replyTo?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get JWT token from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const request: TemplateEmailRequest = await req.json()

    // Validate required fields
    if (!request.recipients || request.recipients.length === 0) {
      throw new Error('Recipients list is required')
    }

    if (!request.templateId && !request.templateName) {
      throw new Error('Template ID or name is required')
    }

    if (!request.templateData) {
      throw new Error('Template data is required')
    }

    // Get template from database
    let templateQuery = supabaseClient
      .from('notification_templates')
      .select('*')
      .eq('is_active', true)

    if (request.templateId) {
      templateQuery = templateQuery.eq('id', request.templateId)
    } else {
      templateQuery = templateQuery.eq('name', request.templateName)
    }

    const { data: template, error: templateError } = await templateQuery.single()

    if (templateError || !template) {
      throw new Error(`Template not found: ${request.templateId || request.templateName}`)
    }

    // Get user details for each recipient
    const { data: users, error: usersError } = await supabaseClient
      .from('profiles')
      .select('id, full_name, email')
      .in('id', request.recipients)

    if (usersError) {
      throw new Error(`Error fetching user details: ${usersError.message}`)
    }

    if (!users || users.length === 0) {
      throw new Error('No valid recipients found')
    }

    // Get email service configuration
    const emailServiceUrl = Deno.env.get('EMAIL_SERVICE_URL')
    const emailServiceApiKey = Deno.env.get('EMAIL_SERVICE_API_KEY')
    const emailServiceFromEmail = Deno.env.get('EMAIL_SERVICE_FROM_EMAIL') || 'noreply@infoline.edu.az'

    if (!emailServiceUrl || !emailServiceApiKey) {
      throw new Error('Email service not configured')
    }

    // Process each recipient individually for personalization
    const emailResults = []
    const deliveryLogs = []

    for (const user of users) {
      try {
        // Prepare personalized template data
        const personalizedData = {
          ...request.templateData,
          full_name: user.full_name,
          email: user.email,
          data_entry_url: `${Deno.env.get('FRONTEND_URL') || 'https://infoline.edu.az'}/data-entry`
        }

        // Render templates
        const renderedTitle = renderTemplate(template.title_template, personalizedData)
        const renderedMessage = renderTemplate(template.message_template, personalizedData)
        
        // Get email template HTML
        const emailHtml = await getEmailTemplate(template.email_template || template.name, personalizedData)
        const finalHtmlContent = emailHtml || `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>${renderedTitle}</h2>
            <p>${renderedMessage}</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Bu email İnfoLine sistemi tərəfindən avtomatik göndərilib.
            </p>
          </div>
        `

        // Prepare email data
        const emailData = {
          from: `${request.fromName || 'İnfoLine Sistem'} <${emailServiceFromEmail}>`,
          to: [user.email],
          subject: renderedTitle,
          html: finalHtmlContent,
          text: stripHtml(renderedMessage),
          reply_to: request.replyTo || emailServiceFromEmail
        }

        // Send email
        const emailResponse = await fetch(emailServiceUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${emailServiceApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailData)
        })

        if (emailResponse.ok) {
          const emailResult = await emailResponse.json()
          emailResults.push({
            userId: user.id,
            email: user.email,
            success: true,
            messageId: emailResult.id
          })

          // Log successful delivery
          deliveryLogs.push({
            delivery_method: 'email',
            status: 'sent',
            attempt_count: 1,
            delivered_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            recipient_email: user.email,
            template_id: template.id
          })
        } else {
          const errorText = await emailResponse.text()
          emailResults.push({
            userId: user.id,
            email: user.email,
            success: false,
            error: errorText
          })

          // Log failed delivery
          deliveryLogs.push({
            delivery_method: 'email',
            status: 'failed',
            attempt_count: 1,
            error_message: errorText,
            created_at: new Date().toISOString(),
            recipient_email: user.email,
            template_id: template.id
          })
        }

      } catch (userError) {
        emailResults.push({
          userId: user.id,
          email: user.email,
          success: false,
          error: userError.message
        })
      }
    }

    // Insert delivery logs
    if (deliveryLogs.length > 0) {
      const { error: logError } = await supabaseClient
        .from('notification_delivery_log')
        .insert(deliveryLogs)

      if (logError) {
        console.error('Error logging email deliveries:', logError)
      }
    }

    // Calculate results
    const successCount = emailResults.filter(r => r.success).length
    const failureCount = emailResults.filter(r => !r.success).length

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        successCount,
        failureCount,
        totalRecipients: users.length,
        results: emailResults,
        templateUsed: template.name
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error sending template email:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

/**
 * Render template with data substitution
 */
function renderTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match
  })
}

/**
 * Get email template HTML
 */
async function getEmailTemplate(templateName: string, data: Record<string, any>): Promise<string | null> {
  const emailTemplates: Record<string, string> = {
    deadline_warning_3_days: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Son Tarix Xəbərdarlığı</h1>
          <p style="color: #fef3c7; margin: 10px 0 0 0; font-size: 16px;">3 gün qalıb</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">Hörmətli <strong>{{full_name}}</strong>,</p>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #92400e; font-weight: 500;">
              "{{category_name}}" kateqoriyası üçün məlumat daxil etmə müddəti <strong>3 gün</strong> sonra bitəcək.
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px;"><strong>Son tarix:</strong> {{deadline_date}}</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{data_entry_url}}" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500; font-size: 16px; transition: background 0.3s;">
              📝 Məlumatları Daxil Et
            </a>
          </div>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin-top: 30px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
              Bu bildiriş İnfoLine sistemi tərəfindən avtomatik göndərilib.
              <br>
              Bildiriş parametrlərini dəyişmək üçün sistem tənzimlərinə daxil olun.
            </p>
          </div>
        </div>
      </div>
    `,
    
    deadline_warning_1_day: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚨 TƏCİLİ: Son Tarix Xəbərdarlığı</h1>
          <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">1 gün qalıb!</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">Hörmətli <strong>{{full_name}}</strong>,</p>
          
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #991b1b; font-weight: 600; font-size: 16px;">
              "{{category_name}}" kateqoriyası üçün məlumat daxil etmə müddəti <strong>sabah bitəcək!</strong>
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px;"><strong>Son tarix:</strong> {{deadline_date}}</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{data_entry_url}}" style="background: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; animation: pulse 2s infinite;">
              ⚡ TƏCİLİ: Məlumatları Daxil Et
            </a>
          </div>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin-top: 30px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
              Bu bildiriş İnfoLine sistemi tərəfindən avtomatik göndərilib.
            </p>
          </div>
        </div>
      </div>
    `,
    
    deadline_expired: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="background: linear-gradient(135deg, #dc2626, #991b1b); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">❌ Son Tarix Keçib</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">Hörmətli <strong>{{full_name}}</strong>,</p>
          
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #991b1b; font-weight: 500;">
              "{{category_name}}" kateqoriyası üçün məlumat daxil etmə müddəti bitib.
            </p>
            <p style="margin: 10px 0 0 0; color: #991b1b;">
              Mövcud məlumatlar avtomatik təsdiqlənəcək.
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px;"><strong>Son tarix idi:</strong> {{deadline_date}}</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin-top: 30px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
              Bu bildiriş İnfoLine sistemi tərəfindən avtomatik göndərilib.
            </p>
          </div>
        </div>
      </div>
    `,
    
    data_approved: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✅ Məlumatlar Təsdiqləndi</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">Hörmətli <strong>{{full_name}}</strong>,</p>
          
          <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #065f46; font-weight: 500;">
              "{{category_name}}" kateqoriyası üçün təqdim etdiyiniz məlumatlar uğurla təsdiqləndi.
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px;"><strong>Təsdiqləyən:</strong> {{approved_by}}</p>
          <p style="color: #374151; font-size: 16px;"><strong>Təsdiq tarixi:</strong> {{approved_date}}</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin-top: 30px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
              Bu bildiriş İnfoLine sistemi tərəfindən avtomatik göndərilib.
            </p>
          </div>
        </div>
      </div>
    `,
    
    data_rejected: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">❌ Məlumatlar Rədd Edildi</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; color: #1f2937; margin: 0 0 20px 0;">Hörmətli <strong>{{full_name}}</strong>,</p>
          
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #991b1b; font-weight: 500;">
              "{{category_name}}" kateqoriyası üçün təqdim etdiyiniz məlumatlar rədd edildi.
            </p>
            <p style="margin: 10px 0 0 0; color: #991b1b;">
              <strong>Səbəb:</strong> {{rejection_reason}}
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{data_entry_url}}" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500; font-size: 16px;">
              🔄 Məlumatları Yenidən Daxil Et
            </a>
          </div>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin-top: 30px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
              Bu bildiriş İnfoLine sistemi tərəfindən avtomatik göndərilib.
            </p>
          </div>
        </div>
      </div>
    `
  }

  const template = emailTemplates[templateName]
  return template ? renderTemplate(template, data) : null
}

/**
 * Strip HTML tags to create plain text version
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Replace HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
}

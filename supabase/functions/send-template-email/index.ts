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
  isTest?: boolean
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

    // Handle test email vs regular email recipients
    let users = []
    
    if (request.isTest && request.recipients.length === 1 && request.recipients[0].includes('@')) {
      // Test email with direct email address
      users = [{
        id: 'test-user',
        full_name: 'Test İstifadəçi',
        email: request.recipients[0]
      }]
    } else {
      // Regular recipients (user IDs)
      if (!request.recipients || request.recipients.length === 0) {
        throw new Error('Recipients list is required')
      }

      const { data: userData, error: usersError } = await supabaseClient
        .from('profiles')
        .select('id, full_name, email')
        .in('id', request.recipients)

      if (usersError) {
        throw new Error(`Error fetching user details: ${usersError.message}`)
      }

      if (!userData || userData.length === 0) {
        throw new Error('No valid recipients found')
      }

      users = userData
    }

    // Initialize email service
    const emailService = new EmailService()
    const emailResults = []
    const deliveryLogs = []

    // Process each recipient individually for personalization
    for (const user of users) {
      try {
        // Prepare personalized template data
        const personalizedData = {
          ...request.templateData,
          full_name: user.full_name,
          email: user.email,
          data_entry_url: `${Deno.env.get('FRONTEND_URL') || 'https://infoline.edu.az'}/data-entry`,
          approved_date: new Date().toLocaleDateString('az-AZ'),
          current_date: new Date().toLocaleDateString('az-AZ')
        }

        // Render templates
        const renderedTitle = renderTemplate(template.title_template, personalizedData)
        const renderedMessage = renderTemplate(template.message_template, personalizedData)
        
        // Get HTML template
        const htmlContent = template.email_template 
          ? renderTemplate(template.email_template, { ...personalizedData, subject: renderedTitle, message: renderedMessage })
          : getDefaultEmailHTML(renderedTitle, renderedMessage, personalizedData)

        // Send email
        const emailResult = await emailService.sendEmail({
          to: user.email,
          subject: renderedTitle,
          html: htmlContent,
          text: stripHtml(renderedMessage),
          fromName: request.fromName || 'İnfoLine Sistem',
          replyTo: request.replyTo
        })

        emailResults.push({
          userId: user.id,
          email: user.email,
          success: emailResult.success,
          messageId: emailResult.messageId,
          error: emailResult.error
        })

        // Log delivery (skip for test emails)
        if (!request.isTest) {
          deliveryLogs.push({
            delivery_method: 'email',
            status: emailResult.success ? 'sent' : 'failed',
            attempt_count: 1,
            delivered_at: emailResult.success ? new Date().toISOString() : null,
            error_message: emailResult.error,
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
        templateUsed: template.name,
        isTest: request.isTest || false
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
 * Email Service Class
 */
class EmailService {
  private resendApiKey: string
  private emailServiceUrl: string
  private fromEmail: string

  constructor() {
    this.resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''
    this.emailServiceUrl = 'https://api.resend.com/emails'
    this.fromEmail = Deno.env.get('FROM_EMAIL') ?? 'noreply@infoline.edu.az'

    if (!this.resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is required')
    }
  }

  async sendEmail(emailData: {
    to: string
    subject: string
    html: string
    text: string
    fromName?: string
    replyTo?: string
  }): Promise<{
    success: boolean
    messageId?: string
    error?: string
  }> {
    try {
      const payload = {
        from: `${emailData.fromName || 'İnfoLine Sistem'} <${this.fromEmail}>`,
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        reply_to: emailData.replyTo || this.fromEmail
      }

      const response = await fetch(this.emailServiceUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const result = await response.json()
        return {
          success: true,
          messageId: result.id
        }
      } else {
        const errorText = await response.text()
        return {
          success: false,
          error: `Email service error: ${errorText}`
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Email send failed: ${error.message}`
      }
    }
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
 * Get default HTML email template
 */
function getDefaultEmailHTML(subject: string, message: string, data: Record<string, any>): string {
  return `
<!DOCTYPE html>
<html lang="az">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .email-container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .email-header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .email-body {
            padding: 30px 20px;
        }
        .email-footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666666;
        }
        .message-content {
            margin: 20px 0;
            line-height: 1.8;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
        }
        .alert-box {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .success-box {
            background-color: #ecfdf5;
            border-left: 4px solid #10b981;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .error-box {
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>📚 İnfoLine</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Təhsil Məlumat Sistemi</p>
        </div>
        
        <div class="email-body">
            <p style="font-size: 18px; margin-bottom: 20px;">Hörmətli <strong>${data.full_name || 'İstifadəçi'}</strong>,</p>
            
            <div class="message-content">
                ${message.replace(/\n/g, '<br>')}
            </div>
            
            ${data.data_entry_url ? `
            <div style="text-align: center; margin: 30px 0;">
                <a href="${data.data_entry_url}" class="cta-button">
                    📝 Sistemə Daxil Ol
                </a>
            </div>
            ` : ''}
        </div>
        
        <div class="email-footer">
            <p>
                Bu email avtomatik olaraq göndərilmişdir.<br>
                Suallar üçün <a href="mailto:support@infoline.edu.az">support@infoline.edu.az</a> ünvanına müraciət edin.
            </p>
            <p style="margin-top: 15px;">
                <small>© 2024 İnfoLine Təhsil Sistemi. Bütün hüquqlar qorunur.</small>
            </p>
        </div>
    </div>
</body>
</html>`
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

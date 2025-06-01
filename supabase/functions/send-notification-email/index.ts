import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string[]
  subject: string
  htmlContent: string
  textContent?: string
  fromName?: string
  replyTo?: string
  templateId?: string
  templateData?: Record<string, any>
  attachments?: EmailAttachment[]
}

interface EmailAttachment {
  filename: string
  content: string // base64 encoded
  contentType: string
  disposition?: 'attachment' | 'inline'
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
    const emailRequest: EmailRequest = await req.json()

    // Validate required fields
    if (!emailRequest.to || emailRequest.to.length === 0) {
      throw new Error('Recipients list is required')
    }

    if (!emailRequest.subject) {
      throw new Error('Subject is required')
    }

    if (!emailRequest.htmlContent) {
      throw new Error('HTML content is required')
    }

    // Get email service configuration from environment
    const emailServiceUrl = Deno.env.get('EMAIL_SERVICE_URL')
    const emailServiceApiKey = Deno.env.get('EMAIL_SERVICE_API_KEY')
    const emailServiceFromEmail = Deno.env.get('EMAIL_SERVICE_FROM_EMAIL') || 'noreply@infoline.edu.az'

    if (!emailServiceUrl || !emailServiceApiKey) {
      throw new Error('Email service not configured')
    }

    // Prepare email data for external service (using Resend as example)
    const emailData = {
      from: `${emailRequest.fromName || 'İnfoLine Sistem'} <${emailServiceFromEmail}>`,
      to: emailRequest.to,
      subject: emailRequest.subject,
      html: emailRequest.htmlContent,
      text: emailRequest.textContent || stripHtml(emailRequest.htmlContent),
      reply_to: emailRequest.replyTo || emailServiceFromEmail,
      attachments: emailRequest.attachments || []
    }

    // Send email via external service
    const emailResponse = await fetch(emailServiceUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailServiceApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      throw new Error(`Email service error: ${errorText}`)
    }

    const emailResult = await emailResponse.json()

    // Log delivery attempt
    const deliveryLogs = emailRequest.to.map(recipient => ({
      notification_id: null, // Will be set by calling function if available
      delivery_method: 'email',
      status: 'sent',
      attempt_count: 1,
      delivered_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      recipient_email: recipient
    }))

    // Insert delivery logs
    const { error: logError } = await supabaseClient
      .from('notification_delivery_log')
      .insert(deliveryLogs)

    if (logError) {
      console.error('Error logging email delivery:', logError)
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        messageId: emailResult.id || crypto.randomUUID(),
        deliveryStatus: 'sent',
        recipientCount: emailRequest.to.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        deliveryStatus: 'failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})

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

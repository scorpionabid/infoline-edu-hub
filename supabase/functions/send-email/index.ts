import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string;
  template_name: string;
  template_data: Record<string, any>;
  subject?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { to, template_name, template_data, subject } = await req.json() as EmailRequest

    // Get email template
    const { data: template, error: templateError } = await supabaseClient
      .from('notification_templates')
      .select('email_template, title_template, message_template')
      .eq('name', template_name)
      .eq('is_active', true)
      .single()

    if (templateError || !template) {
      throw new Error(`Template not found: ${template_name}`)
    }

    // Render template
    let emailBody = template.email_template || template.message_template
    let emailSubject = subject || template.title_template

    // Replace variables
    for (const [key, value] of Object.entries(template_data)) {
      const placeholder = `{{${key}}}`
      emailBody = emailBody.replace(new RegExp(placeholder, 'g'), String(value))
      emailSubject = emailSubject.replace(new RegExp(placeholder, 'g'), String(value))
    }

    // Send email using your preferred service
    // Example with SendGrid, Resend, or SMTP
    
    // For now, just log the email (replace with actual email service)
    console.log('Sending email:', {
      to,
      subject: emailSubject,
      body: emailBody
    })

    // Log email delivery
    await supabaseClient
      .from('notification_delivery_log')
      .insert({
        user_id: template_data.user_id,
        delivery_method: 'email',
        recipient_email: to,
        template_id: template_data.template_id,
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: {
          subject: emailSubject,
          template_name,
          template_data
        }
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        email_id: crypto.randomUUID()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Email sending error:', error)
    
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
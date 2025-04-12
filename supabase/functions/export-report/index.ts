
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS üçün OPTIONS sorğusunu emal edirik
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Supabase klienti yaradırıq
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );
    
    // Sorğu body-sini alırıq
    const { reportId, format } = await req.json();
    
    if (!reportId || !format) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Zəruri parametrlər çatışmır: reportId və ya format'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    // İstifadəçi məlumatlarını alırıq
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'İstifadəçi təsdiqlənmədi' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }
    
    // Hesabat məlumatlarını alırıq
    const { data: report, error: reportError } = await supabaseClient
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();
    
    if (reportError || !report) {
      return new Response(
        JSON.stringify({ success: false, error: 'Hesabat tapılmadı' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      );
    }
    
    // Hesabat məlumatlarını ixrac edirik
    let exportData;
    
    if (format === 'excel') {
      // Excel formatını simulyasiya edirik
      exportData = {
        url: `https://olbfnauhzpdskqnxtwav.supabase.co/storage/v1/object/reports/report_${reportId}.xlsx`,
        format: 'excel'
      };
    } else if (format === 'pdf') {
      // PDF formatını simulyasiya edirik
      exportData = {
        url: `https://olbfnauhzpdskqnxtwav.supabase.co/storage/v1/object/reports/report_${reportId}.pdf`,
        format: 'pdf'
      };
    } else if (format === 'csv') {
      // CSV formatını simulyasiya edirik
      exportData = {
        url: `https://olbfnauhzpdskqnxtwav.supabase.co/storage/v1/object/reports/report_${reportId}.csv`,
        format: 'csv'
      };
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Dəstəklənməyən format' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }
    
    // Audit log əlavə edirik
    const { error: auditError } = await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'export_report',
        entity_type: 'report',
        entity_id: reportId,
        new_value: { format, exported_at: new Date().toISOString() }
      });
    
    if (auditError) {
      console.error("Audit log əlavə edilərkən xəta:", auditError);
      // Audit log xətası əsas əməliyyatı dayandırmamalıdır
    }
    
    return new Response(
      JSON.stringify({ success: true, data: exportData }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error("Serverdə xəta:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

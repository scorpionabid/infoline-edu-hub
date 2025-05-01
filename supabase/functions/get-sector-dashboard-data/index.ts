
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  // CORS sorğusunu emal et
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Parametrləri al
    const { sectorId } = await req.json();
    
    // Supabase clienti yarat
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Sektor məlumatlarını al
    const { data: sector, error: sectorError } = await supabase
      .from('sectors')
      .select('*, region:regions(id, name)')
      .eq('id', sectorId)
      .single();
    
    if (sectorError) throw new Error(`Sektor məlumatları alınarkən xəta: ${sectorError.message}`);
    
    // Məktəblərin sayını al
    const { count: schoolCount, error: schoolCountError } = await supabase
      .from('schools')
      .select('id', { count: 'exact', head: true })
      .eq('sector_id', sectorId);
    
    if (schoolCountError) throw new Error(`Məktəb sayı alınarkən xəta: ${schoolCountError.message}`);
    
    // İstifadəçilərin sayını al
    const { count: userCount, error: userCountError } = await supabase
      .from('user_roles')
      .select('id', { count: 'exact', head: true })
      .eq('sector_id', sectorId);
    
    if (userCountError) throw new Error(`İstifadəçi sayı alınarkən xəta: ${userCountError.message}`);
    
    // Məktəb statistikasını al
    const { data: schoolStats, error: schoolStatsError } = await supabase.rpc('get_sector_stats', { sector_id_param: sectorId });
    
    if (schoolStatsError) throw new Error(`Statistikalar alınarkən xəta: ${schoolStatsError.message}`);
    
    // Tamamlanma faizini hesabla
    const completionRate = schoolStats ? schoolStats.completion_rate : 0;
    
    // Kateqoriyaları al
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('status', 'active')
      .order('priority', { ascending: true })
      .limit(5);
    
    if (categoriesError) throw new Error(`Kateqoriyalar alınarkən xəta: ${categoriesError.message}`);
    
    // Təsdiq gözləyən məlumatları al
    const { data: pendingApprovals, error: pendingApprovalsError } = await supabase
      .from('data_entries')
      .select('id, category_id, school_id, status, created_at, schools(name)')
      .eq('status', 'pending')
      .in('school_id', (
        await supabase
          .from('schools')
          .select('id')
          .eq('sector_id', sectorId)
      ).data?.map(s => s.id) || [])
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (pendingApprovalsError) throw new Error(`Təsdiq gözləyən məlumatlar alınarkən xəta: ${pendingApprovalsError.message}`);
    
    // Bildirişləri al
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('id, type, title, message, created_at, is_read')
      .eq('user_id', (
        await supabase
          .from('user_roles')
          .select('user_id')
          .eq('sector_id', sectorId)
          .eq('role', 'sectoradmin')
          .single()
      ).data?.user_id || '')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (notificationsError) throw new Error(`Bildirişlər alınarkən xəta: ${notificationsError.message}`);
    
    // Məktəb statistikasını al
    const { data: schoolsData, error: schoolsDataError } = await supabase
      .from('schools')
      .select('id, name, completion_rate')
      .eq('sector_id', sectorId)
      .order('name', { ascending: true });
    
    if (schoolsDataError) throw new Error(`Məktəb məlumatları alınarkən xəta: ${schoolsDataError.message}`);
    
    // Dashboard məlumatlarını hazırla
    const dashboardData = {
      sector: {
        id: sector.id,
        name: sector.name,
        status: sector.status
      },
      region: {
        id: sector.region.id,
        name: sector.region.name
      },
      schools: {
        total: schoolCount || 0,
        active: (
          await supabase
            .from('schools')
            .select('id', { count: 'exact', head: true })
            .eq('sector_id', sectorId)
            .eq('status', 'active')
        ).count || 0
      },
      stats: {
        completion_rate: completionRate,
        total_entries: schoolStats ? (schoolStats.total_approved + schoolStats.total_pending + schoolStats.total_rejected) : 0,
        pending_count: schoolStats ? schoolStats.total_pending : 0,
        pending_schools: (
          await supabase.from('data_entries')
            .select('school_id', { count: 'exact', head: true })
            .eq('status', 'pending')
            .in('school_id', (
              await supabase
                .from('schools')
                .select('id')
                .eq('sector_id', sectorId)
            ).data?.map(s => s.id) || [])
        ).count || 0
      },
      schoolStats: schoolsData?.map(school => ({
        id: school.id,
        name: school.name,
        completion_rate: school.completion_rate || 0,
        pending_count: (
          pendingApprovals?.filter(p => p.school_id === school.id)?.length || 0
        )
      })) || [],
      notifications: notifications?.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        date: n.created_at,
        type: n.type,
        isRead: n.is_read
      })) || []
    };
    
    return new Response(JSON.stringify(dashboardData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[get-sector-dashboard-data] Xəta: ${errorMessage}`);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

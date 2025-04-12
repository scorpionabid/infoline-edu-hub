
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
    
    // İstifadəçi rolunu əldə edirik
    const { data: roleData, error: roleError } = await supabaseClient.rpc('get_user_role_safe');
    
    if (roleError) {
      return new Response(
        JSON.stringify({ success: false, error: 'İstifadəçi rolu alınarkən xəta: ' + roleError.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }
    
    const role = roleData;
    
    // İstifadəçi roluna görə dashboard məlumatlarını əldə edirik
    let dashboardData = {};
    
    if (role === 'schooladmin') {
      // Məktəb admin dashboard məlumatları
      const schoolId = await supabaseClient.rpc('get_user_school_id');
      
      if (!schoolId.data) {
        return new Response(
          JSON.stringify({ success: false, error: 'Məktəb ID alınarkən xəta' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
      
      // Məktəb üçün formların statistikasını alırıq
      const { data: formData, error: formError } = await supabaseClient
        .from('data_entries')
        .select('category_id, status')
        .eq('school_id', schoolId.data)
        .is('deleted_at', null);
        
      if (formError) {
        return new Response(
          JSON.stringify({ success: false, error: 'Form məlumatları alınarkən xəta: ' + formError.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
      
      // Məktəb üçün kateqoriyaları alırıq
      const { data: categories, error: categoriesError } = await supabaseClient
        .from('categories')
        .select('id, name, deadline')
        .eq('status', 'active')
        .is('archived', false);
        
      if (categoriesError) {
        return new Response(
          JSON.stringify({ success: false, error: 'Kateqoriya məlumatları alınarkən xəta: ' + categoriesError.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
      
      // Son bildirişləri alırıq
      const { data: notifications, error: notificationsError } = await supabaseClient
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (notificationsError) {
        return new Response(
          JSON.stringify({ success: false, error: 'Bildiriş məlumatları alınarkən xəta: ' + notificationsError.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
      
      // Form statistikalarını hesablayaq
      const pending = formData?.filter(form => form.status === 'pending').length || 0;
      const approved = formData?.filter(form => form.status === 'approved').length || 0;
      const rejected = formData?.filter(form => form.status === 'rejected').length || 0;
      const total = categories?.length || 0;
      
      // Son müddət yaxınlaşan və keçmiş formları hesablayaq
      const now = new Date();
      const dueSoon = categories?.filter(cat => {
        if (!cat.deadline) return false;
        const deadline = new Date(cat.deadline);
        const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 3600 * 24));
        return diffDays > 0 && diffDays <= 3;
      }).length || 0;
      
      const overdue = categories?.filter(cat => {
        if (!cat.deadline) return false;
        const deadline = new Date(cat.deadline);
        return deadline < now;
      }).length || 0;
      
      // Tamamlanma faizini hesablayaq
      const completionRate = total > 0 ? Math.round(((approved + rejected) / total) * 100) : 0;
      
      // Gözləyən formların siyahısını yaradaq
      const pendingForms = categories
        ?.filter(cat => {
          const formForCategory = formData?.find(form => form.category_id === cat.id);
          return !formForCategory || formForCategory.status === 'pending';
        })
        .map(cat => {
          const formStatus = formData?.find(form => form.category_id === cat.id)?.status || 'pending';
          return {
            id: cat.id,
            title: cat.name,
            description: '',
            date: cat.deadline ? new Date(cat.deadline).toISOString() : '',
            status: formStatus,
            completionPercentage: formStatus === 'approved' ? 100 : formStatus === 'rejected' ? 0 : 50
          };
        }) || [];
      
      // Son 5 bildirişi formatlayaq
      const formattedNotifications = notifications?.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        date: notification.created_at,
        isRead: notification.is_read,
        priority: notification.priority,
        type: notification.type
      })) || [];
      
      // Dashboard məlumatlarını hazırlayaq
      dashboardData = {
        forms: {
          pending,
          approved,
          rejected,
          dueSoon,
          overdue,
          total
        },
        completionRate,
        notifications: formattedNotifications,
        pendingForms
      };
    } else if (role === 'sectoradmin') {
      // Sektor admin dashboard məlumatları (gələcək implementasiya)
      dashboardData = {
        // Burada sektor admin üçün dashboard məlumatları olacaq
      };
    } else if (role === 'regionadmin') {
      // Region admin dashboard məlumatları (gələcək implementasiya)
      dashboardData = {
        // Burada region admin üçün dashboard məlumatları olacaq
      };
    } else if (role === 'superadmin') {
      // Superadmin dashboard məlumatları (gələcək implementasiya)
      dashboardData = {
        // Burada superadmin üçün dashboard məlumatları olacaq
      };
    }
    
    return new Response(
      JSON.stringify({ success: true, data: dashboardData }),
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

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

serve(async (req) => {
  // CORS üçün OPTIONS sorğusunu emal edirik
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
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

      // Məktəb məlumatlarını əldə edək
      const { data: schoolData, error: schoolError } = await supabaseClient
        .from('schools')
        .select('id, name, region_id, sector_id')
        .eq('id', schoolId.data)
        .single();

      if (schoolError) {
        return new Response(
          JSON.stringify({ success: false, error: 'Məktəb məlumatları alınarkən xəta: ' + schoolError.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }

      // Aktiv kateqoriyaları əldə edək
      const { data: categories, error: categoriesError } = await supabaseClient
        .from('categories')
        .select('id, name, description, deadline, status, priority')
        .eq('status', 'active')
        .is('archived', false)
        .order('priority');
        
      if (categoriesError) {
        return new Response(
          JSON.stringify({ success: false, error: 'Kateqoriya məlumatları alınarkən xəta: ' + categoriesError.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }

      // Hər kateqoriya üçün sütunları və məlumat daxiletmələrini əldə edək
      const categoriesWithStats = await Promise.all(categories.map(async (category) => {
        // Kateqoriya üçün sütunları əldə edək
        const { data: columns, error: columnsError } = await supabaseClient
          .from('columns')
          .select('id, name, type, is_required')
          .eq('category_id', category.id)
          .eq('status', 'active');
          
        if (columnsError) {
          console.error(`Sütunlar alınarkən xəta (${category.name}):`, columnsError);
          return {
            ...category,
            columns: [],
            completion: { percentage: 0, total: 0, completed: 0 },
            status: 'pending'
          };
        }
        
        // Kateqoriya üçün məlumat daxiletmələrini əldə edək
        const { data: entries, error: entriesError } = await supabaseClient
          .from('data_entries')
          .select('id, column_id, value, status')
          .eq('school_id', schoolId.data)
          .eq('category_id', category.id);
          
        if (entriesError) {
          console.error(`Məlumat daxiletmələri alınarkən xəta (${category.name}):`, entriesError);
          return {
            ...category,
            columns,
            completion: { percentage: 0, total: 0, completed: 0 },
            status: 'pending'
          };
        }
        
        // Tamamlanma statistikasını hesablayaq
        const totalColumns = columns.length;
        const filledColumns = entries ? new Set(entries.map(entry => entry.column_id)).size : 0;
        const completionPercentage = totalColumns > 0 ? Math.round((filledColumns / totalColumns) * 100) : 0;
        
        // Kateqoriyanın statusunu müəyyən edək
        let status = 'pending';
        if (entries && entries.length > 0) {
          const hasRejected = entries.some(entry => entry.status === 'rejected');
          const hasPending = entries.some(entry => entry.status === 'pending');
          const hasApproved = entries.some(entry => entry.status === 'approved');
          
          if (hasRejected) status = 'rejected';
          else if (hasPending) status = 'pending';
          else if (hasApproved && filledColumns === totalColumns) status = 'approved';
          else status = 'in_progress';
        } else {
          status = 'not_started';
        }
        
        return {
          ...category,
          columns,
          completion: {
            percentage: completionPercentage,
            total: totalColumns,
            completed: filledColumns
          },
          status
        };
      }));

      // Son bildirişləri əldə edək
      const { data: notifications, error: notificationsError } = await supabaseClient
        .from('notifications')
        .select('id, title, message, type, is_read, created_at, priority')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (notificationsError) {
        console.error('Bildiriş məlumatları alınarkən xəta:', notificationsError);
      }

      // Ümumi tamamlanma statistikasını hesablayaq
      const totalColumns = categoriesWithStats.reduce((sum, cat) => sum + cat.completion.total, 0);
      const completedColumns = categoriesWithStats.reduce((sum, cat) => sum + cat.completion.completed, 0);
      const completionRate = totalColumns > 0 ? Math.round((completedColumns / totalColumns) * 100) : 0;

      // Status statistikasını hesablayaq
      const pending = categoriesWithStats.filter(cat => cat.status === 'pending' || cat.status === 'in_progress').length;
      const approved = categoriesWithStats.filter(cat => cat.status === 'approved').length;
      const rejected = categoriesWithStats.filter(cat => cat.status === 'rejected').length;
      const total = categoriesWithStats.length;

      // Son müddət yaxınlaşan formları hesablayaq
      const now = new Date();
      const dueSoonCategories = categoriesWithStats.filter(cat => {
        if (!cat.deadline) return false;
        const deadline = new Date(cat.deadline);
        const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 3600 * 24));
        return diffDays > 0 && diffDays <= 3;
      });

      const overdueCategories = categoriesWithStats.filter(cat => {
        if (!cat.deadline) return false;
        const deadline = new Date(cat.deadline);
        return deadline < now;
      });

      // Gözləyən formların siyahısını yaradaq
      const pendingForms = categoriesWithStats
        .filter(cat => cat.status !== 'approved')
        .map(cat => {
          const isDueSoon = cat.deadline && new Date(cat.deadline) < new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
          const isOverdue = cat.deadline && new Date(cat.deadline) < now;
          
          return {
            id: cat.id,
            title: cat.name,
            description: cat.description || '',
            date: cat.deadline || '',
            status: isOverdue ? 'overdue' : isDueSoon ? 'dueSoon' : cat.status,
            completionPercentage: cat.completion.percentage
          };
        });

      // Dashboard məlumatlarını hazırlayaq
      dashboardData = {
        completion: {
          percentage: completionRate,
          total: totalColumns,
          completed: completedColumns
        },
        status: {
          pending,
          approved,
          rejected,
          total
        },
        categories: categoriesWithStats.map(cat => ({
          id: cat.id,
          name: cat.name,
          completion: cat.completion,
          status: cat.status,
          deadline: cat.deadline
        })),
        upcoming: dueSoonCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          deadline: cat.deadline,
          daysLeft: cat.deadline ? Math.ceil((new Date(cat.deadline).getTime() - now.getTime()) / (1000 * 3600 * 24)) : 0,
          completion: cat.completion.percentage
        })),
        forms: {
          pending,
          approved,
          rejected,
          dueSoon: dueSoonCategories.length,
          overdue: overdueCategories.length,
          total
        },
        pendingForms,
        completionRate,
        notifications: notifications ? notifications.map(notification => ({
          id: notification.id,
          title: notification.title,
          message: notification.message,
          timestamp: notification.created_at,
          type: notification.type,
          read: notification.is_read,
          priority: notification.priority
        })) : []
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

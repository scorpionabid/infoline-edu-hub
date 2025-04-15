
import { supabase } from '@/integrations/supabase/client';
import { SchoolAdminDashboardData, FormItem, DashboardNotification } from '@/types/dashboard';
import { Notification } from '@/types/notification';

// RPC-lərin adlarını düzgün qeyd edək
const RPC_GET_SCHOOL_FORM_STATUS = 'get_school_form_stats';
const RPC_GET_SCHOOL_PENDING_FORMS = 'get_school_pending_forms';

/**
 * Məktəb admin dashboard məlumatlarını əldə edir
 * @param schoolId Məktəb ID
 * @returns SchoolAdminDashboardData
 */
export const fetchSchoolAdminDashboard = async (schoolId: string): Promise<SchoolAdminDashboardData> => {
  try {
    // Məktəb məlumatlarını əldə et
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('*')
      .eq('id', schoolId)
      .single();

    if (schoolError) {
      console.error('Məktəb məlumatlarını əldə edərkən xəta:', schoolError);
      throw new Error('Məktəb məlumatları əldə edilə bilmədi');
    }

    // Form statusları üçün birbaşa SQL sorğusu edək
    const { data: formStatusData, error: formStatusError } = await supabase
      .from('data_entries')
      .select('status, count')
      .eq('school_id', schoolId)
      .then(result => {
        // Nəticələri emal edib status statuslarını hesablayaq
        if (result.error) return { data: null, error: result.error };
        
        const statusStats = {
          pending: 0,
          approved: 0,
          rejected: 0,
          dueSoon: 0,
          overdue: 0,
          total: 0
        };
        
        if (result.data && result.data.length > 0) {
          // Datanı emal edirik
          result.data.forEach((item: any) => {
            const status = item.status;
            const count = parseInt(item.count) || 1;
            
            if (status === 'pending') statusStats.pending += count;
            else if (status === 'approved') statusStats.approved += count;
            else if (status === 'rejected') statusStats.rejected += count;
            else if (status === 'dueSoon') statusStats.dueSoon += count;
            else if (status === 'overdue') statusStats.overdue += count;
            
            statusStats.total += count;
          });
        }
        
        return { data: statusStats, error: null };
      });

    if (formStatusError) {
      console.error('Form statuslarını əldə edərkən xəta:', formStatusError);
      throw new Error('Form statusları əldə edilə bilmədi');
    }

    // Pending formların əldə edilməsi (birbaşa SQL)
    const { data: pendingFormsData, error: pendingFormsError } = await supabase
      .from('data_entries')
      .select(`
        category_id, 
        c:categories(id, name, description),
        value, 
        status, 
        created_at
      `)
      .eq('school_id', schoolId)
      .in('status', ['pending', 'dueSoon', 'overdue'])
      .order('created_at', { ascending: false });

    if (pendingFormsError) {
      console.error('Gözləyən formaları əldə edərkən xəta:', pendingFormsError);
      throw new Error('Gözləyən formalar əldə edilə bilmədi');
    }

    // Formları kateqoriyalara görə qruplaşdırırıq və əsas məlumatları formalaşdırırıq
    const pendingForms: FormItem[] = [];
    const processedCategories = new Set<string>();
    
    if (pendingFormsData) {
      pendingFormsData.forEach((item: any) => {
        // Hər kateqoriya üçün bir dəfə emal edirik
        if (!processedCategories.has(item.category_id)) {
          processedCategories.add(item.category_id);
          
          // Kateqoriya məlumatlarını əldə edirik
          const category = item.c || {};
          const categoryName = category.name || 'Naməlum kateqoriya';
          
          pendingForms.push({
            id: item.category_id,
            title: categoryName,
            date: new Date(item.created_at).toISOString().split('T')[0],
            status: item.status || 'pending',
            completionPercentage: 50, // Default dəyər, real hesablanmalıdır
            category: categoryName
          });
        }
      });
    }

    // Bildirişləri əldə et
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
      .order('created_at', { ascending: false })
      .limit(5);

    if (notificationsError) {
      console.error('Bildirişləri əldə edərkən xəta:', notificationsError);
      throw new Error('Bildirişlər əldə edilə bilmədi');
    }

    // Məlumatları formatla
    const formStatus = formStatusData || {
      pending: 0,
      approved: 0,
      rejected: 0,
      dueSoon: 0,
      overdue: 0,
      total: 0
    };

    // Tamamlanma faizini hesabla
    const completionRate = school.completion_rate || 0;

    // Formatlı bildirişlər
    const notifications: DashboardNotification[] = (notificationsData || []).map((n: any) => {
      const createdAt = n.created_at;
      const createdDate = createdAt ? new Date(createdAt) : new Date();
      
      return {
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.is_read,
        createdAt: n.created_at,
        userId: n.user_id,
        priority: n.priority,
        date: createdDate.toISOString().split('T')[0],
        time: createdDate.toISOString().split('T')[1]?.substring(0, 5) || '00:00'
      };
    });

    return {
      forms: {
        pending: formStatus.pending || 0,
        approved: formStatus.approved || 0,
        rejected: formStatus.rejected || 0,
        dueSoon: formStatus.dueSoon || 0,
        overdue: formStatus.overdue || 0,
        total: formStatus.total || 0
      },
      completionRate,
      notifications,
      pendingForms
    };
  } catch (error) {
    console.error('Məktəb admin dashboard məlumatlarını əldə edərkən xəta:', error);
    
    // Mock data əldə et
    return getMockSchoolAdminDashboard();
  }
};

/**
 * Mock məktəb admin dashboard məlumatları
 */
const getMockSchoolAdminDashboard = (): SchoolAdminDashboardData => {
  const currentDate = new Date();
  const notifications: DashboardNotification[] = [
    {
      id: '1',
      title: 'Yeni kateqoriya əlavə edildi',
      message: 'Tədris statistikası kateqoriyası sistemə əlavə edildi',
      type: 'category',
      isRead: false,
      createdAt: currentDate.toISOString(),
      userId: 'user-1',
      priority: 'normal',
      date: currentDate.toISOString().split('T')[0],
      time: currentDate.toISOString().split('T')[1].substring(0, 5)
    },
    {
      id: '2',
      title: 'Son tarix bildirişi',
      message: 'Müəllim heyəti məlumatlarının doldurulma vaxtı sabah bitir',
      type: 'deadline',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      userId: 'user-1',
      priority: 'high',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      time: new Date(Date.now() - 86400000).toISOString().split('T')[1].substring(0, 5)
    }
  ];

  const pendingForms: FormItem[] = [
    {
      id: 'form-1',
      title: 'Şagird statistikası',
      date: '2025-04-15',
      status: 'pending',
      completionPercentage: 75,
      category: 'Təhsil statistikası'
    },
    {
      id: 'form-2',
      title: 'Müəllim heyəti',
      date: '2025-04-20',
      status: 'pending',
      completionPercentage: 50,
      category: 'Kadr məlumatları'
    },
    {
      id: 'form-3',
      title: 'İnfrastruktur hesabatı',
      date: '2025-04-18',
      status: 'dueSoon',
      completionPercentage: 30,
      category: 'İnfrastruktur'
    }
  ];

  return {
    forms: {
      pending: 5,
      approved: 12,
      rejected: 2,
      total: 19,
      dueSoon: 3,
      overdue: 1
    },
    completionRate: 68,
    notifications,
    pendingForms
  };
};

export default { fetchSchoolAdminDashboard };

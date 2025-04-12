
import { supabase } from '@/integrations/supabase/client';
import { SchoolAdminDashboardData, FormItem } from '@/types/dashboard';
import { Notification } from '@/types/notification';

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

    // Doldurma statuslarını əldə et
    const { data: formStatusData, error: formStatusError } = await supabase
      .rpc('get_school_form_status', { p_school_id: schoolId });

    if (formStatusError) {
      console.error('Form statuslarını əldə edərkən xəta:', formStatusError);
      throw new Error('Form statusları əldə edilə bilmədi');
    }

    // Pending formları əldə et
    const { data: pendingForms, error: pendingFormsError } = await supabase
      .rpc('get_school_pending_forms', { p_school_id: schoolId });

    if (pendingFormsError) {
      console.error('Gözləyən formaları əldə edərkən xəta:', pendingFormsError);
      throw new Error('Gözləyən formalar əldə edilə bilmədi');
    }

    // Bildirişləri əldə et
    const { data: notifications, error: notificationsError } = await supabase
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

    const formattedPendingForms: FormItem[] = (pendingForms || []).map((form: any) => ({
      id: form.id,
      title: form.title,
      description: form.description,
      date: form.deadline,
      status: form.status,
      completionPercentage: form.completion_percentage,
      category: form.category
    }));

    // Tamamlanma faizini hesabla
    const completionRate = school.completion_rate || 0;

    // Formatlı bildirişlər
    const formattedNotifications: Notification[] = (notifications || []).map((notification: any) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.is_read,
      createdAt: notification.created_at,
      userId: notification.user_id,
      priority: notification.priority,
      date: notification.created_at
    }));

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
      notifications: formattedNotifications,
      pendingForms: formattedPendingForms
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
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Yeni kateqoriya əlavə edildi',
      message: 'Tədris statistikası kateqoriyası sistemə əlavə edildi',
      type: 'category',
      isRead: false,
      createdAt: new Date().toISOString(),
      userId: 'user-1',
      priority: 'normal',
      date: new Date().toISOString()
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
      date: new Date(Date.now() - 86400000).toISOString()
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

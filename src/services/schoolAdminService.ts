
import { SchoolAdminDashboardData } from '@/types/dashboard';
import { supabase } from '@/integrations/supabase/client';
import { Notification } from '@/types/notification';
import { FormItem } from '@/types/dashboard';

/**
 * Məktəb admin dashboard məlumatlarını əldə etmək üçün
 */
export const fetchSchoolAdminDashboardData = async (schoolId: string): Promise<SchoolAdminDashboardData> => {
  try {
    // Burada həqiqi API çağırışı ola bilər
    // 1. Tamamlanmış anketlər üçün
    const { data: formsData, error: formsError } = await supabase
      .from('data_entries')
      .select('id, status, category_id')
      .eq('school_id', schoolId);
    
    if (formsError) throw formsError;
    
    // 2. Bildirişlər üçün
    const { data: notifData, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', supabase.auth.getUser() ? (await supabase.auth.getUser()).data.user?.id : '');
    
    if (notifError) throw notifError;
    
    // Anketlərin sayını hesablayır
    const pendingCount = formsData?.filter(form => form.status === 'pending').length || 0;
    const approvedCount = formsData?.filter(form => form.status === 'approved').length || 0;
    const rejectedCount = formsData?.filter(form => form.status === 'rejected').length || 0;
    const totalCount = formsData?.length || 0;
    
    // Pending anketləri əldə edir
    const pendingForms: FormItem[] = formsData
      ?.filter(form => form.status === 'pending')
      .slice(0, 5)
      .map((form, index) => ({
        id: form.id,
        title: `Form ${index + 1}`,
        description: 'Təsdiq gözləyir',
        date: new Date().toISOString(),
        status: 'pending',
        completionPercentage: 100
      })) || [];
    
    // Bildirişləri formatlaşdırır
    const notifications: Notification[] = notifData?.map(notif => ({
      id: notif.id,
      title: notif.title,
      message: notif.message, 
      type: notif.type,
      isRead: notif.is_read,
      createdAt: notif.created_at,
      userId: notif.user_id,
      priority: notif.priority || 'normal',
      date: notif.created_at // Dashboard üçün date sahəsi əlavə edilir
    })) || [];
    
    // Ümumi tamamlama faizini hesablayır
    const completionRate = totalCount === 0 ? 0 : Math.round((approvedCount / totalCount) * 100);
    
    return {
      forms: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        dueSoon: 2, // Mock data
        overdue: 1, // Mock data
        total: totalCount
      },
      completionRate,
      notifications,
      pendingForms
    };
  } catch (error) {
    console.error('Məktəb admin məlumatları əldə edilərkən xəta:', error);
    throw error;
  }
};

/**
 * Mock data generasiyası
 */
export const generateMockSchoolAdminData = (): SchoolAdminDashboardData => {
  // Bugünün tarixini al
  const date = new Date().toISOString();
  
  // Pending forms üçün mock data
  const pendingForms: FormItem[] = [
    {
      id: '1',
      title: 'Şagird Aktivlik Anketi',
      description: 'Şagirdlərin dərslərdəki iştirakı',
      date,
      status: 'pending',
      completionPercentage: 75
    },
    {
      id: '2',
      title: 'Müəllim İnkişaf Anketi',
      description: 'Müəllimlərin peşəkar inkişafı',
      date,
      status: 'pending',
      completionPercentage: 90
    },
    {
      id: '3',
      title: 'Məktəb Ehtiyacları Anketi',
      description: 'Məktəbin infrastruktur ehtiyacları',
      date,
      status: 'pending',
      completionPercentage: 60
    }
  ];
  
  // Bildirişlər üçün mock data
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Yeni Anket',
      message: 'Yeni şagird aktivlik anketi yaradıldı.',
      type: 'info',
      isRead: false,
      createdAt: date,
      userId: 'mock-user-id',
      priority: 'normal',
      date: date
    },
    {
      id: '2',
      title: 'Son tarix yaxınlaşır',
      message: 'Müəllim inkişaf anketini doldurmaq üçün 2 gün qalıb.',
      type: 'warning',
      isRead: false,
      createdAt: date,
      userId: 'mock-user-id',
      priority: 'high',
      date: date
    }
  ];
  
  return {
    forms: {
      pending: 5,
      approved: 12,
      rejected: 3,
      dueSoon: 2,
      overdue: 1,
      total: 20
    },
    completionRate: 60,
    notifications,
    pendingForms
  };
};

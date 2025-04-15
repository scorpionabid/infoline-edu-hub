
import { supabase } from '@/integrations/supabase/client';
import { Form, FormStatus } from '@/types/form';
import { DashboardNotification } from '@/types/dashboard';
import { adaptForm, adaptNotification } from '@/types/adapters';

/**
 * Məktəb admini dashboard-u üçün lazımi məlumatları əldə edən servis
 */
export const schoolAdminService = {
  /**
   * Məktəb admini üçün notification-ları əldə et
   */
  getNotifications: async (userId: string): Promise<DashboardNotification[]> => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      // Notification-ları uyğun formata çevir
      return (data || []).map(adaptNotification);
    } catch (error) {
      console.error('Bildirişləri əldə edərkən xəta:', error);
      return [];
    }
  },
  
  /**
   * Məktəb admininin formlarını əldə et
   */
  getForms: async (schoolId: string): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
    total: number;
  }> => {
    try {
      // Gerçək verilənlər bazası sorğusu burada olacaq
      // Hələlik sadə mock məlumat döndürürük
      
      const mockStats = {
        pending: 5,
        approved: 12,
        rejected: 2,
        dueSoon: 3,
        overdue: 1,
        total: 23
      };
      
      return mockStats;
    } catch (error) {
      console.error('Formları əldə edərkən xəta:', error);
      return {
        pending: 0,
        approved: 0,
        rejected: 0,
        dueSoon: 0,
        overdue: 0,
        total: 0
      };
    }
  },
  
  /**
   * Məktəb üçün kateqoriyaları və formları əldə et
   */
  getFormsByStatus: async (schoolId: string, status: string): Promise<Form[]> => {
    try {
      // Gələcəkdə gerçək verilənlər bazası sorğusu burada olacaq
      // Hələlik sadə mock məlumat döndürürük
      
      const mockForms: Form[] = [
        {
          id: '1',
          title: 'Fizika Test Nəticələri',
          status: FormStatus.PENDING,
          completionPercentage: 75,
          dueDate: '2025-05-15T00:00:00Z',
          description: 'Şagirdlərin son fizika test nəticələri',
          date: '2025-04-10T00:00:00Z'
        },
        {
          id: '2',
          title: 'Məktəb İnfrastruktur Hesabatı',
          status: FormStatus.APPROVED,
          completionPercentage: 100,
          dueDate: '2025-04-05T00:00:00Z',
          description: 'Məktəb infrastrukturunun vəziyyəti haqqında hesabat',
          date: '2025-04-01T00:00:00Z'
        },
        {
          id: '3',
          title: 'Müəllim Davamiyyət Hesabatı',
          status: FormStatus.REJECTED,
          completionPercentage: 60,
          dueDate: '2025-04-20T00:00:00Z',
          description: 'Müəllimlərin davamiyyət məlumatları',
          date: '2025-04-12T00:00:00Z'
        },
        {
          id: '4',
          title: 'Şagird Nailiyyətləri',
          status: FormStatus.DUE_SOON,
          completionPercentage: 40,
          dueDate: '2025-04-18T00:00:00Z',
          description: 'Şagirdlərin xüsusi nailiyyətləri',
          date: '2025-04-14T00:00:00Z'
        },
        {
          id: '5',
          title: 'Məktəb Maliyyə Hesabatı',
          status: FormStatus.OVERDUE,
          completionPercentage: 30,
          dueDate: '2025-04-01T00:00:00Z',
          description: 'Məktəbin maliyyə vəziyyəti haqqında hesabat',
          date: '2025-03-25T00:00:00Z'
        }
      ];
      
      // Status parametrinə görə filter et
      if (status !== 'all') {
        return mockForms.filter(form => {
          if (status === 'dueSoon') {
            return form.status === FormStatus.DUE_SOON;
          } else if (status === 'overdue') {
            return form.status === FormStatus.OVERDUE;
          } else {
            return form.status.toLowerCase() === status.toLowerCase();
          }
        });
      }
      
      return mockForms;
    } catch (error) {
      console.error('Formları əldə edərkən xəta:', error);
      return [];
    }
  },
  
  /**
   * Gözləmədə olan formları əldə et
   */
  getPendingForms: async (schoolId: string): Promise<Form[]> => {
    try {
      return await schoolAdminService.getFormsByStatus(schoolId, 'pending');
    } catch (error) {
      console.error('Gözləmədə olan formları əldə edərkən xəta:', error);
      return [];
    }
  },
  
  /**
   * Formun detallarını əldə et
   */
  getFormDetails: async (formId: string): Promise<Form | null> => {
    try {
      // Gələcəkdə gerçək verilənlər bazası sorğusu burada olacaq
      // Hələlik sadə mock məlumat döndürürük
      
      const mockForm: Form = {
        id: formId,
        title: 'Fizika Test Nəticələri',
        status: FormStatus.PENDING,
        completionPercentage: 75,
        dueDate: '2025-05-15T00:00:00Z',
        description: 'Şagirdlərin son fizika test nəticələri',
        date: '2025-04-10T00:00:00Z'
      };
      
      return mockForm;
    } catch (error) {
      console.error('Form detallarını əldə edərkən xəta:', error);
      return null;
    }
  },
  
  /**
   * Məktəbin bütün formlarının məlumatlarını əldə et
   */
  getSchoolAdminDashboardData: async (schoolId: string) => {
    try {
      const notifications = await schoolAdminService.getNotifications('current-user-id');
      const forms = await schoolAdminService.getForms(schoolId);
      const pendingForms = await schoolAdminService.getPendingForms(schoolId);
      
      const completionRate = forms.total > 0 
        ? Math.round((forms.approved / forms.total) * 100) 
        : 0;
      
      return {
        forms,
        pendingForms,
        completionRate,
        notifications
      };
    } catch (error) {
      console.error('Məktəb admin məlumatlarını əldə edərkən xəta:', error);
      throw error;
    }
  }
};

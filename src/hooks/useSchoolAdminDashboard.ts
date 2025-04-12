
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { SchoolAdminDashboardData } from '@/types/dashboard';

export const useSchoolAdminDashboard = () => {
  const { user } = useAuth();
  const schoolId = user?.schoolId;
  
  const fetchDashboardData = async (): Promise<SchoolAdminDashboardData> => {
    if (!schoolId) {
      throw new Error('Məktəb ID-si tapılmadı');
    }
    
    try {
      // Kateqoriyaları əldə edirik
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, description, deadline')
        .eq('status', 'active')
        .order('priority', { ascending: true });
      
      if (categoriesError) throw categoriesError;
      
      // Məlumatları əldə edirik
      const { data: entries, error: entriesError } = await supabase
        .from('data_entries')
        .select('id, category_id, status, column_id')
        .eq('school_id', schoolId);
      
      if (entriesError) throw entriesError;
      
      // Bildirisləri əldə edirik
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (notificationsError) throw notificationsError;
      
      // Statuslara görə məlumatları qruplaşdırırıq
      const pendingCount = entries.filter(e => e.status === 'pending').length;
      const approvedCount = entries.filter(e => e.status === 'approved').length;
      const rejectedCount = entries.filter(e => e.status === 'rejected').length;
      
      // Kateqoriya və sütunları hesablayırıq
      const { data: columns, error: columnsError } = await supabase
        .from('columns')
        .select('id, category_id')
        .eq('status', 'active');
      
      if (columnsError) throw columnsError;
      
      // Hər kateqoriya üçün sütunların sayını hesablayırıq
      const columnCountByCategory = columns.reduce((acc, column) => {
        acc[column.category_id] = (acc[column.category_id] || 0) + 1;
        return acc;
      }, {});
      
      // Gözləmədə olan formları hazırlayırıq
      const pendingForms = categories.map(category => {
        const categoryEntries = entries.filter(e => e.category_id === category.id);
        const pendingEntries = categoryEntries.filter(e => e.status === 'pending');
        const totalColumns = columnCountByCategory[category.id] || 0;
        
        let status: string = 'pending';
        if (category.deadline) {
          const deadline = new Date(category.deadline);
          const now = new Date();
          const threeDaysFromNow = new Date();
          threeDaysFromNow.setDate(now.getDate() + 3);
          
          if (deadline < now) {
            status = 'overdue';
          } else if (deadline <= threeDaysFromNow) {
            status = 'dueSoon';
          }
        }
        
        return {
          id: category.id,
          title: category.name,
          description: category.description,
          date: category.deadline ? new Date(category.deadline).toLocaleDateString() : 'Son tarix təyin edilməyib',
          status,
          completionPercentage: totalColumns ? Math.round((pendingEntries.length / totalColumns) * 100) : 0
        };
      }).filter(form => form.status === 'pending' || form.status === 'dueSoon' || form.status === 'overdue');
      
      // Son tarixə görə gözləmədə olan formları və son tarixə az qalmış olanları hesablayırıq
      const dueSoonCount = pendingForms.filter(form => form.status === 'dueSoon').length;
      const overdueCount = pendingForms.filter(form => form.status === 'overdue').length;
      
      // Tamamlanma dərəcəsini hesablayırıq
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('completion_rate')
        .eq('id', schoolId)
        .single();
      
      if (schoolError) throw schoolError;
      
      // Dashboard məlumatlarını qaytarırıq
      return {
        forms: {
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          dueSoon: dueSoonCount,
          overdue: overdueCount,
          total: pendingCount + approvedCount + rejectedCount
        },
        completionRate: school.completion_rate || 0,
        notifications: notifications.map(notification => ({
          id: notification.id,
          title: notification.title,
          message: notification.message,
          date: new Date(notification.created_at).toLocaleDateString(),
          isRead: notification.is_read,
          priority: notification.priority,
          type: notification.type
        })),
        pendingForms
      };
    } catch (error) {
      console.error('Dashboard məlumatları əldə edilərkən xəta:', error);
      throw error;
    }
  };
  
  return useQuery({
    queryKey: ['schoolAdminDashboard', schoolId],
    queryFn: fetchDashboardData,
    enabled: !!schoolId && !!user,
    refetchInterval: 60000, // Hər dəqiqə yeniləyirik
    retry: 2,
    onError: (error: any) => {
      toast.error('Dashboard məlumatları əldə edilərkən xəta', { 
        description: error.message 
      });
    }
  });
};

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TableNames } from '@/types/db';
import { SchoolAdminDashboardData, FormItem } from '@/types/dashboard';
import { Notification } from '@/types/notification';
import { toast } from 'sonner';

interface UseSchoolAdminDashboardResult {
  data: SchoolAdminDashboardData;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useSchoolAdminDashboard = (): UseSchoolAdminDashboardResult => {
  const { user } = useAuth();
  const [data, setData] = useState<SchoolAdminDashboardData>({
    forms: {
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0,
      dueSoon: 0,
      overdue: 0
    },
    notifications: [],
    completionRate: 0,
    pendingForms: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.schoolId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Fetching dashboard data for school admin, school ID: ${user.schoolId}`);
      
      // Pending məlumatların sayını əldə et
      const { count: pendingCount, error: pendingError } = await supabase
        .from(TableNames.DATA_ENTRIES)
        .select('*', { count: 'exact', head: true })
        .eq('school_id', user.schoolId)
        .eq('status', 'pending');
      
      if (pendingError) throw pendingError;
      
      // Approved məlumatların sayını əldə et
      const { count: approvedCount, error: approvedError } = await supabase
        .from(TableNames.DATA_ENTRIES)
        .select('*', { count: 'exact', head: true })
        .eq('school_id', user.schoolId)
        .eq('status', 'approved');
      
      if (approvedError) throw approvedError;
      
      // Rejected məlumatların sayını əldə et
      const { count: rejectedCount, error: rejectedError } = await supabase
        .from(TableNames.DATA_ENTRIES)
        .select('*', { count: 'exact', head: true })
        .eq('school_id', user.schoolId)
        .eq('status', 'rejected');
      
      if (rejectedError) throw rejectedError;
      
      // Son tarixə görə deadline-i yaxınlaşan məlumatlar
      const { count: dueSoonCount, error: dueSoonError } = await supabase
        .from(TableNames.CATEGORIES)
        .select('*', { count: 'exact', head: true })
        .gte('deadline', new Date().toISOString())
        .lte('deadline', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()); // 7 gün
      
      if (dueSoonError) throw dueSoonError;
      
      // Vaxtı keçmiş məlumatlar
      const { count: overdueCount, error: overdueError } = await supabase
        .from(TableNames.CATEGORIES)
        .select('*', { count: 'exact', head: true })
        .lt('deadline', new Date().toISOString());
      
      if (overdueError) throw overdueError;
      
      // Məktəb üçün bildirişləri əldə et
      const { data: notifications, error: notificationsError } = await supabase
        .from(TableNames.NOTIFICATIONS)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (notificationsError) throw notificationsError;
      
      // Pending formları əldə et
      const { data: pendingForms, error: pendingFormsError } = await supabase
        .from(TableNames.DATA_ENTRIES)
        .select(`
          id,
          status,
          created_at,
          updated_at,
          category:${TableNames.CATEGORIES}(name)
        `)
        .eq('school_id', user.schoolId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (pendingFormsError) throw pendingFormsError;
      
      // Formları formatlayırıq
      const formattedPendingForms: FormItem[] = pendingForms.map(form => ({
        id: form.id,
        title: form.category ? form.category.name || 'Unknown Category' : 'Unknown Category',
        date: new Date(form.created_at).toLocaleDateString(),
        status: form.status,
        completionPercentage: 100, // Tam doldurulmuş sayırıq çünki təqdim edilib
        category: form.category ? form.category.name : undefined
      }));
      
      // Tamamlanma faizini hesablayırıq - hələlik sadə bir formula
      const totalEntries = pendingCount + approvedCount + rejectedCount;
      const approvalRate = totalEntries > 0 
        ? Math.round((approvedCount / totalEntries) * 100) 
        : 0;
      
      // Data state-ni yeniləyirik
      setData({
        forms: {
          pending: pendingCount || 0,
          approved: approvedCount || 0,
          rejected: rejectedCount || 0,
          total: (pendingCount || 0) + (approvedCount || 0) + (rejectedCount || 0),
          dueSoon: dueSoonCount || 0,
          overdue: overdueCount || 0
        },
        notifications: formatNotifications(notifications || []),
        completionRate: approvalRate,
        pendingForms: formattedPendingForms,
        formsByStatus: {
          pending: pendingCount || 0,
          approved: approvedCount || 0, 
          rejected: rejectedCount || 0
        }
      });
      
      console.log('School admin dashboard data loaded successfully');
    } catch (err: any) {
      console.error('Error fetching school admin dashboard data:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Bilinməyən xəta'));
      toast.error('Məlumatları yükləyərkən xəta baş verdi', {
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.schoolId, user?.id]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
};

const formatNotifications = (notifications: any[]): Notification[] => {
  return notifications.map(notification => ({
    id: notification.id,
    title: notification.title,
    message: notification.message || '',
    type: notification.type,
    isRead: notification.is_read,
    createdAt: notification.created_at,
    userId: notification.user_id,
    priority: notification.priority || 'normal',
    time: formatTime(notification.created_at)
  }));
};

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'İndicə';
  if (diffMins < 60) return `${diffMins} dəqiqə əvvəl`;
  if (diffHours < 24) return `${diffHours} saat əvvəl`;
  if (diffDays < 7) return `${diffDays} gün əvvəl`;
  
  return date.toLocaleDateString();
};

interface RegionItem {
  id: string;
  name: string;
}

interface SectorItem {
  id: string;
  name: string;
}

export const getRegionNames = async (): Promise<RegionItem[]> => {
  try {
    const { data, error } = await supabase
      .from('regions')
      .select('id, name');
      
    if (error) throw error;
    
    if (!data) return [];
    
    // Data obyektinin strukturunu dəqiq təyin edirik
    return data.map((region: any) => ({
      id: region.id || '',
      name: region.name || ''
    }));
  } catch (error) {
    console.error('Region adları əldə edilərkən xəta:', error);
    return [];
  }
};

export const getSectorNames = async (): Promise<SectorItem[]> => {
  try {
    const { data, error } = await supabase
      .from('sectors')
      .select('id, name');
      
    if (error) throw error;
    
    if (!data) return [];
    
    // Data obyektinin strukturunu dəqiq təyin edirik
    return data.map((sector: any) => ({
      id: sector.id || '',
      name: sector.name || ''
    }));
  } catch (error) {
    console.error('Sektor adları əldə edilərkən xəta:', error);
    return [];
  }
};

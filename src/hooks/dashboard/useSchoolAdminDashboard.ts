
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TableNames } from '@/types/db';
import { FormItem, SchoolAdminDashboardData } from '@/types/dashboard';
import { toast } from 'sonner';
import { formatNotifications } from './notificationUtils';
import { UseSchoolAdminDashboardResult } from './types';

export const useSchoolAdminDashboard = (): UseSchoolAdminDashboardResult => {
  const { user } = useAuth();
  const [data, setData] = useState<SchoolAdminDashboardData>({
    schoolName: 'Məktəb adı yüklənir...',
    sectorName: 'Sektor adı yüklənir...',
    regionName: 'Region adı yüklənir...',
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
      
      // Məktəb məlumatlarını əldə et
      const { data: schoolData, error: schoolError } = await supabase
        .from(TableNames.SCHOOLS)
        .select(`
          name,
          sectors(name),
          regions(name)
        `)
        .eq('id', user.schoolId)
        .single();
        
      if (schoolError) throw schoolError;
      
      // Formları formatlayırıq - Type xətalarını düzəltmək üçün kodu yenilədik
      const formattedPendingForms: FormItem[] = pendingForms.map(form => {
        // Kateqoriya adı almaq üçün düzgün və ətraflı yoxlama - bütün mümkün formatları yoxlama
        let categoryName = 'Unknown Category';
        
        if (form.category) {
          if (typeof form.category === 'string') {
            // Əgər direktdə string olaraq gəlibsə
            categoryName = form.category;
          } else if (typeof form.category === 'object') {
            if (Array.isArray(form.category)) {
              // Əgər massivdirsə və içində element varsa
              if (form.category.length > 0) {
                const firstItem = form.category[0];
                if (typeof firstItem === 'string') {
                  categoryName = firstItem;
                } else if (typeof firstItem === 'object' && firstItem && 'name' in firstItem) {
                  categoryName = firstItem.name;
                }
              }
            } else if (form.category !== null) {
              // Əgər tək obyektdirsə
              const category = form.category as any;
              if ('name' in category) {
                categoryName = category.name;
              }
            }
          }
        }
        
        return {
          id: form.id,
          title: categoryName,
          date: new Date(form.created_at).toLocaleDateString(),
          status: form.status,
          completionPercentage: 100, // Tam doldurulmuş sayırıq çünki təqdim edilib
          category: categoryName
        };
      });
      
      // Tamamlanma faizini hesablayırıq - hələlik sadə bir formula
      const totalEntries = pendingCount + approvedCount + rejectedCount;
      const approvalRate = totalEntries > 0 
        ? Math.round((approvedCount / totalEntries) * 100) 
        : 0;
      
      // School data-dan məktəb, sektor, region adlarını çıxarış
      let sectorName = 'Sektor adı';
      let regionName = 'Region adı';
      
      // schoolData.sectors və schoolData.regions üçün tip yoxlamalarını təkmilləşdirdik
      if (schoolData && schoolData.sectors) {
        // Əgər sectors bir obyektdirsə və name xüsusiyyəti varsa
        if (typeof schoolData.sectors === 'object' && 'name' in schoolData.sectors) {
          sectorName = schoolData.sectors.name || 'Sektor adı';
        }
      }
      
      if (schoolData && schoolData.regions) {
        // Əgər regions bir obyektdirsə və name xüsusiyyəti varsa
        if (typeof schoolData.regions === 'object' && 'name' in schoolData.regions) {
          regionName = schoolData.regions.name || 'Region adı';
        }
      }
      
      // Data state-ni yeniləyirik
      setData({
        schoolName: schoolData?.name || 'Məktəb adı',
        sectorName: sectorName,
        regionName: regionName,
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

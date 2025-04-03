
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChartData } from '@/types/dashboard';
import { useAuth } from '@/context/AuthContext';

interface DashboardData {
  totalSchools?: number;
  activeSchools?: number;
  pendingForms?: number;
  completedForms?: number;
  upcomingDeadlines?: any[];
  notifications?: any[];
  totalUsers?: number;
  activeUsers?: number;
  totalCategories?: number;
  totalColumns?: number;
  totalForms?: number;
  regionStatistics?: any[];
  sectorStatistics?: any[];
  schoolsInSector?: any[];
  // Məktəb adminləri üçün əlavə edilmiş sahələr
  schoolName?: string;
  sectorName?: string;
  regionName?: string;
  completionRate?: number;
  forms?: {
    pending: number;
    approved: number;
    rejected: number;
    dueSoon: number;
    overdue: number;
  };
  recentForms?: any[];
}

export const useSupabaseDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('İstifadəçi məlumatları tapılmadı');
      }

      const roleQueries: Record<string, () => Promise<any>> = {
        // SuperAdmin üçün ümumi statistika
        superadmin: async () => {
          const [
            { count: totalSchools }, 
            { count: activeSchools },
            { count: totalCategories },
            { count: totalColumns },
            { count: pendingEntries },
            { data: regions },
            { data: recentNotifications }
          ] = await Promise.all([
            supabase.from('schools').select('*', { count: 'exact', head: true }),
            supabase.from('schools').select('*', { count: 'exact', head: true }).eq('status', 'active'),
            supabase.from('categories').select('*', { count: 'exact', head: true }),
            supabase.from('columns').select('*', { count: 'exact', head: true }),
            supabase.from('data_entries').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('regions').select('id, name, status').order('name'),
            supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
          ]);
          
          return {
            totalSchools,
            activeSchools,
            totalCategories,
            totalColumns,
            pendingForms: pendingEntries,
            completedForms: 0, // Real data will be fetched and calculated
            regionStatistics: regions,
            notifications: recentNotifications
          };
        },
        
        // RegionAdmin üçün öz regionu üzrə statistika
        regionadmin: async () => {
          if (!user.regionId) {
            throw new Error('Region ID tapılmadı');
          }
          
          const [
            { count: totalSchools }, 
            { count: activeSchools },
            { count: totalSectors },
            { count: pendingEntries },
            { data: sectorsList },
            { data: recentNotifications }
          ] = await Promise.all([
            supabase.from('schools').select('*', { count: 'exact', head: true }).eq('region_id', user.regionId),
            supabase.from('schools').select('*', { count: 'exact', head: true }).eq('region_id', user.regionId).eq('status', 'active'),
            supabase.from('sectors').select('*', { count: 'exact', head: true }).eq('region_id', user.regionId),
            supabase.from('data_entries').select('*', { count: 'exact', head: true })
              .eq('status', 'pending')
              .in('school_id', supabase.from('schools').select('id').eq('region_id', user.regionId)),
            supabase.from('sectors').select('id, name, status').eq('region_id', user.regionId).order('name'),
            supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
          ]);
          
          return {
            totalSchools,
            activeSchools,
            totalSectors,
            pendingForms: pendingEntries,
            sectorStatistics: sectorsList,
            notifications: recentNotifications
          };
        },
        
        // SectorAdmin üçün öz sektoru üzrə statistika
        sectoradmin: async () => {
          if (!user.sectorId) {
            throw new Error('Sektor ID tapılmadı');
          }
          
          const [
            { count: totalSchools }, 
            { count: activeSchools },
            { count: pendingEntries },
            { data: schoolsList },
            { data: recentNotifications },
            { data: sectorData }
          ] = await Promise.all([
            supabase.from('schools').select('*', { count: 'exact', head: true }).eq('sector_id', user.sectorId),
            supabase.from('schools').select('*', { count: 'exact', head: true }).eq('sector_id', user.sectorId).eq('status', 'active'),
            supabase.from('data_entries').select('*', { count: 'exact', head: true })
              .eq('status', 'pending')
              .in('school_id', supabase.from('schools').select('id').eq('sector_id', user.sectorId)),
            supabase.from('schools').select('id, name, status, completion_rate').eq('sector_id', user.sectorId).order('name'),
            supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
            supabase.from('sectors').select('name, region_id').eq('id', user.sectorId).single()
          ]);
          
          let regionName = '';
          if (sectorData && sectorData.region_id) {
            const { data: regionData } = await supabase
              .from('regions')
              .select('name')
              .eq('id', sectorData.region_id)
              .single();
            
            if (regionData) {
              regionName = regionData.name;
            }
          }
          
          return {
            totalSchools,
            activeSchools,
            pendingForms: pendingEntries,
            schoolsInSector: schoolsList,
            notifications: recentNotifications,
            sectorName: sectorData?.name || '',
            regionName
          };
        },
        
        // SchoolAdmin üçün öz məktəbi üzrə statistika
        schooladmin: async () => {
          if (!user.schoolId) {
            throw new Error('Məktəb ID tapılmadı');
          }
          
          const [
            { data: schoolData },
            { data: pendingForms },
            { data: approvedForms },
            { data: rejectedForms },
            { data: recentNotifications },
            { data: upcomingDeadlines },
            { data: pastDueDeadlines },
            { data: allForms }
          ] = await Promise.all([
            supabase.from('schools').select('*, sectors(name, region_id), regions(name)').eq('id', user.schoolId).single(),
            supabase.from('data_entries').select('*', { count: 'exact' }).eq('school_id', user.schoolId).eq('status', 'pending'),
            supabase.from('data_entries').select('*', { count: 'exact' }).eq('school_id', user.schoolId).eq('status', 'approved'),
            supabase.from('data_entries').select('*', { count: 'exact' }).eq('school_id', user.schoolId).eq('status', 'rejected'),
            supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
            supabase.from('categories')
              .select('id, name, deadline')
              .gte('deadline', new Date().toISOString())
              .order('deadline')
              .limit(5),
            supabase.from('categories')
              .select('id, name, deadline')
              .lt('deadline', new Date().toISOString())
              .order('deadline', { ascending: false })
              .limit(5),
            supabase.from('categories').select('id, name, deadline')
          ]);
          
          // Formların müxtəlif statusları
          const forms = {
            pending: pendingForms?.length || 0,
            approved: approvedForms?.length || 0,
            rejected: rejectedForms?.length || 0,
            dueSoon: upcomingDeadlines?.length || 0,
            overdue: pastDueDeadlines?.length || 0
          };
          
          // Son tarixə görə sıralanmış formların siyahısı
          let recentForms = allForms?.map(category => {
            // Tamamlanma faizini hesablamaq üçün əsas məlumatlar əlavə edilməlidir
            const completionPercentage = Math.floor(Math.random() * 101); // Real datada bu hesablanacaq
            
            return {
              id: category.id,
              title: category.name,
              category: 'Əsas',
              status: category.deadline && new Date(category.deadline) < new Date() ? 'overdue' : 
                       category.deadline && new Date(category.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'due' : 'pending',
              completionPercentage,
              deadline: category.deadline
            };
          }) || [];
          
          return {
            schoolName: schoolData?.name || '',
            sectorName: schoolData?.sectors?.name || '',
            regionName: schoolData?.regions?.name || '',
            completionRate: schoolData?.completion_rate || 0,
            forms,
            recentForms,
            notifications: recentNotifications,
            upcomingDeadlines
          };
        }
      };
      
      // İstifadəçinin rolu əsasında uyğun məlumatları əldə et
      if (user.role && roleQueries[user.role]) {
        const data = await roleQueries[user.role]();
        setDashboardData(data || {});
      } else {
        throw new Error('İstifadəçi rolu dəstəklənmir');
      }
      
      setChartData(await fetchChartData(user.role, user.id, user.regionId, user.sectorId, user.schoolId));
    } catch (err: any) {
      console.error('Dashboard məlumatlarını əldə edərkən xəta:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchChartData = async (
    role?: string, 
    userId?: string, 
    regionId?: string, 
    sectorId?: string, 
    schoolId?: string
  ): Promise<ChartData> => {
    try {
      // Müxtəlif qrafiklər üçün məlumatları əldə et
      let activityData = [];
      let regionSchoolsData = [];
      let categoryCompletionData = [];
      
      // İstifadəçi roluna görə qrafik məlumatlarını əldə et
      switch (role) {
        case 'superadmin':
          // Regionlar üzrə məktəb sayları
          const { data: regionData } = await supabase
            .from('regions')
            .select('name, id');
          
          if (regionData) {
            const regionPromises = regionData.map(async (region) => {
              const { count } = await supabase
                .from('schools')
                .select('*', { count: 'exact', head: true })
                .eq('region_id', region.id);
              
              return { name: region.name, value: count || 0 };
            });
            
            regionSchoolsData = await Promise.all(regionPromises);
          }
          
          // Kateqoriyalar üzrə tamamlanma statistikası
          const { data: categoriesData } = await supabase
            .from('categories')
            .select('name, id');
          
          if (categoriesData) {
            const categoryPromises = categoriesData.map(async (category) => {
              const { count: total } = await supabase
                .from('data_entries')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', category.id);
              
              const { count: completed } = await supabase
                .from('data_entries')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', category.id)
                .eq('status', 'approved');
              
              return { 
                name: category.name, 
                completed: completed || 0,
                total: total || 0
              };
            });
            
            categoryCompletionData = await Promise.all(categoryPromises);
          }
          break;
          
        case 'regionadmin':
          if (regionId) {
            // Sektorlar üzrə məktəb sayları
            const { data: sectorData } = await supabase
              .from('sectors')
              .select('name, id')
              .eq('region_id', regionId);
            
            if (sectorData) {
              const sectorPromises = sectorData.map(async (sector) => {
                const { count } = await supabase
                  .from('schools')
                  .select('*', { count: 'exact', head: true })
                  .eq('sector_id', sector.id);
                
                return { name: sector.name, value: count || 0 };
              });
              
              regionSchoolsData = await Promise.all(sectorPromises);
            }
          }
          break;
          
        case 'sectoradmin':
          if (sectorId) {
            // Məktəblər üzrə tamamlanma statistikası
            const { data: schoolsData } = await supabase
              .from('schools')
              .select('name, id, completion_rate')
              .eq('sector_id', sectorId);
            
            if (schoolsData) {
              regionSchoolsData = schoolsData.map(school => ({
                name: school.name,
                value: school.completion_rate || 0
              }));
            }
          }
          break;
          
        case 'schooladmin':
          if (schoolId) {
            // Kateqoriyalar üzrə tamamlanma statistikası
            const { data: categoriesData } = await supabase
              .from('categories')
              .select('name, id');
            
            if (categoriesData) {
              const categoryPromises = categoriesData.map(async (category) => {
                const { count: total } = await supabase
                  .from('data_entries')
                  .select('*', { count: 'exact', head: true })
                  .eq('category_id', category.id)
                  .eq('school_id', schoolId);
                
                const { count: completed } = await supabase
                  .from('data_entries')
                  .select('*', { count: 'exact', head: true })
                  .eq('category_id', category.id)
                  .eq('school_id', schoolId)
                  .eq('status', 'approved');
                
                return { 
                  name: category.name, 
                  completed: completed || 0,
                  total: total || 0
                };
              });
              
              categoryCompletionData = await Promise.all(categoryPromises);
            }
          }
          break;
      }
      
      // Son aktivlik məlumatları (bütün rollar üçün)
      const { data: activityLogs } = await supabase
        .from('data_entries')
        .select('created_at, status')
        .order('created_at', { ascending: false })
        .limit(30);
      
      if (activityLogs) {
        // Aktivlikləri tarixlərə görə qruplaşdır
        const groupedActivity = activityLogs.reduce((acc: Record<string, number>, log) => {
          const date = new Date(log.created_at).toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});
        
        activityData = Object.entries(groupedActivity).map(([date, count]) => ({
          name: date,
          value: count
        }));
      }
      
      return {
        activityData,
        regionSchoolsData,
        categoryCompletionData
      };
    } catch (err) {
      console.error('Qrafik məlumatlarını əldə edərkən xəta:', err);
      return {
        activityData: [],
        regionSchoolsData: [],
        categoryCompletionData: []
      };
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refreshData = () => {
    fetchDashboardData();
  };

  return {
    dashboardData,
    isLoading,
    error,
    chartData,
    refreshData
  };
};


import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { 
  DashboardData, 
  SuperAdminDashboardData, 
  RegionAdminDashboardData, 
  SectorAdminDashboardData, 
  SchoolAdminDashboardData,
  ChartData,
  FormItem
} from '@/types/dashboard';
import { supabase } from '@/integrations/supabase/client';

// Xəta statusu tipi
type ErrorStatus = {
  code: string;
  message: string;
  details?: any;
}

export const useSupabaseDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [chartData, setChartData] = useState<ChartData>({
    activityData: [],
    regionSchoolsData: [],
    categoryCompletionData: []
  });
  
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  
  // İstifadəçi rolunu və müvafiq məlumatları əldə etmək
  const fetchRoleBasedData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('fetchRoleBasedData çağırıldı, istifadəçi:', user);

      // İstifadəçi rolunu Supabase vasitəsilə dəqiqləşdirək
      if (user && user.id) {
        // Supabase funksiyası ilə istifadəçi rolunu əldə edirik
        const { data: roleData, error: roleError } = await supabase.rpc(
          'get_user_role_safe'
        );

        if (roleError) {
          console.error('İstifadəçi rolunu əldə edərkən xəta:', roleError);
          throw new Error(`İstifadəçi rolunu əldə etmək mümkün olmadı: ${roleError.message}`);
        }

        console.log('Əldə edilən istifadəçi rolu:', roleData);
        setUserRole(roleData || user.role || 'schooladmin');
        const currentRole = roleData || user.role || 'schooladmin';

        // İstifadəçinin roluna uyğun məlumatları əldə edirik
        switch(currentRole) {
          case 'superadmin':
            await fetchSuperAdminData();
            break;
          case 'regionadmin':
            await fetchRegionAdminData();
            break;
          case 'sectoradmin':
            await fetchSectorAdminData();
            break;
          case 'schooladmin':
          default:
            await fetchSchoolAdminData();
            break;
        }

        // Diaqram məlumatlarını hazırlayaq
        await fetchChartData(currentRole);

      } else {
        throw new Error('İstifadəçi məlumatları mövcud deyil');
      }
    } catch (err: any) {
      console.error('Məlumatları əldə edərkən xəta:', err);
      setError(err instanceof Error ? err : new Error(err?.message || 'Bilinməyən xəta'));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // SuperAdmin üçün məlumatlar
  const fetchSuperAdminData = async () => {
    try {
      console.log('SuperAdmin məlumatları əldə edilir...');
      
      // Ümumi region sayını əldə edirik
      const { data: regions, error: regionsError } = await supabase
        .from('regions')
        .select('id, name')
        .eq('status', 'active');
      
      if (regionsError) throw regionsError;
      
      // Ümumi sektor sayını əldə edirik
      const { data: sectors, error: sectorsError } = await supabase
        .from('sectors')
        .select('id, name')
        .eq('status', 'active');
      
      if (sectorsError) throw sectorsError;
      
      // Ümumi məktəb sayını əldə edirik
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name, status');
      
      if (schoolsError) throw schoolsError;
      
      // İstifadəçiləri əldə edirik
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id');
      
      if (profilesError) throw profilesError;
      
      // Kateqoriyaları əldə edirik
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, deadline, status')
        .eq('status', 'active')
        .order('priority', { ascending: true });
      
      if (categoriesError) throw categoriesError;
      
      // Bildirişləri əldə edirik
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (notificationsError) throw notificationsError;
      
      const activeSchools = schools.filter(school => school.status === 'active').length;
      
      // Gələcək tarixləri hazırlayaq
      const upcomingDeadlines = categories
        .filter(cat => cat.deadline)
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 5)
        .map(cat => ({
          category: cat.name,
          date: new Date(cat.deadline).toLocaleDateString('az-AZ')
        }));
      
      // SuperAdmin dashboard məlumatlarını hazırlayaq
      const superAdminData: SuperAdminDashboardData = {
        regions: regions.length,
        sectors: sectors.length,
        schools: schools.length,
        users: profiles.length,
        completionRate: 75, // Bu, məlumat dolulma faizi, hesablana bilər
        pendingApprovals: 15, // Mock data, real data ilə əvəz olunmalıdır
        totalUsers: profiles.length,
        activeUsers: profiles.length, // Aktiv istifadəçilər, daha dəqiq hesablama əlavə edilə bilər
        totalCategories: categories.length,
        totalSectors: sectors.length,
        totalRegions: regions.length,
        pendingForms: [], // Doldurulmalıdır
        upcomingDeadlines,
        notifications: notifications || [],
        pendingSchools: schools.filter(s => s.status === 'pending').length || 0,
        approvedSchools: activeSchools,
        rejectedSchools: schools.filter(s => s.status === 'rejected').length || 0
      };
      
      console.log('SuperAdmin məlumatları hazırlandı:', superAdminData);
      setDashboardData(superAdminData);
      
    } catch (err: any) {
      console.error('SuperAdmin məlumatları əldə edilərkən xəta:', err);
      throw err;
    }
  };

  // RegionAdmin üçün məlumatlar
  const fetchRegionAdminData = async () => {
    try {
      console.log('RegionAdmin məlumatları əldə edilir...');
      
      if (!user?.regionId) {
        throw new Error('İstifadəçi üçün region ID müəyyən edilməyib');
      }
      
      // Region məlumatlarını əldə edirik
      const { data: regionData, error: regionError } = await supabase
        .from('regions')
        .select('name')
        .eq('id', user.regionId)
        .single();
      
      if (regionError) throw regionError;
      
      // Bu regiondakı sektorları əldə edirik
      const { data: sectors, error: sectorsError } = await supabase
        .from('sectors')
        .select('id, name')
        .eq('region_id', user.regionId)
        .eq('status', 'active');
      
      if (sectorsError) throw sectorsError;
      
      // Bu regiondakı məktəbləri əldə edirik
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name, status')
        .eq('region_id', user.regionId);
      
      if (schoolsError) throw schoolsError;
      
      // Bu regiondakı istifadəçiləri əldə edə bilərik
      const { data: userRoles, error: userRolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('region_id', user.regionId);
      
      if (userRolesError) throw userRolesError;
      
      // Kateqoriyaları əldə edirik
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, deadline, status')
        .eq('status', 'active')
        .order('priority', { ascending: true });
      
      if (categoriesError) throw categoriesError;
      
      // Bildirişləri əldə edirik
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (notificationsError) throw notificationsError;
      
      const activeSchools = schools.filter(school => school.status === 'active').length;
      
      // Gələcək tarixləri hazırlayaq
      const upcomingDeadlines = categories
        .filter(cat => cat.deadline)
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 5)
        .map(cat => ({
          category: cat.name,
          date: new Date(cat.deadline).toLocaleDateString('az-AZ')
        }));
      
      // RegionAdmin dashboard məlumatlarını hazırlayaq
      const regionAdminData: RegionAdminDashboardData = {
        regionName: regionData.name,
        sectors: sectors.length,
        schools: schools.length,
        users: userRoles.length,
        completionRate: 70, // Bu, məlumat dolulma faizi, hesablana bilər
        pendingApprovals: 10, // Mock data, real data ilə əvəz olunmalıdır
        pendingForms: [], // Doldurulmalıdır
        upcomingDeadlines,
        notifications: notifications || [],
        pendingSchools: schools.filter(s => s.status === 'pending').length || 0,
        approvedSchools: activeSchools,
        rejectedSchools: schools.filter(s => s.status === 'rejected').length || 0
      };
      
      console.log('RegionAdmin məlumatları hazırlandı:', regionAdminData);
      setDashboardData(regionAdminData);
      
    } catch (err: any) {
      console.error('RegionAdmin məlumatları əldə edilərkən xəta:', err);
      throw err;
    }
  };

  // SectorAdmin üçün məlumatlar
  const fetchSectorAdminData = async () => {
    try {
      console.log('SectorAdmin məlumatları əldə edilir...');
      
      if (!user?.sectorId) {
        throw new Error('İstifadəçi üçün sektor ID müəyyən edilməyib');
      }
      
      // Sektor məlumatlarını əldə edirik
      const { data: sectorData, error: sectorError } = await supabase
        .from('sectors')
        .select('name, region_id')
        .eq('id', user.sectorId)
        .single();
      
      if (sectorError) throw sectorError;
      
      // Region məlumatlarını əldə edirik
      const { data: regionData, error: regionError } = await supabase
        .from('regions')
        .select('name')
        .eq('id', sectorData.region_id)
        .single();
      
      if (regionError) throw regionError;
      
      // Bu sektordakı məktəbləri əldə edirik
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('id, name, status')
        .eq('sector_id', user.sectorId);
      
      if (schoolsError) throw schoolsError;
      
      // Kateqoriyaları əldə edirik
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, deadline, status')
        .eq('status', 'active')
        .order('priority', { ascending: true });
      
      if (categoriesError) throw categoriesError;
      
      // Bildirişləri əldə edirik
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (notificationsError) throw notificationsError;
      
      const activeSchools = schools.filter(school => school.status === 'active').length;
      
      // Gələcək tarixləri hazırlayaq
      const upcomingDeadlines = categories
        .filter(cat => cat.deadline)
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 5)
        .map(cat => ({
          category: cat.name,
          date: new Date(cat.deadline).toLocaleDateString('az-AZ')
        }));
      
      // SectorAdmin dashboard məlumatlarını hazırlayaq
      const sectorAdminData: SectorAdminDashboardData = {
        sectorName: sectorData.name,
        regionName: regionData.name,
        schools: schools.length,
        completionRate: 65, // Bu, məlumat dolulma faizi, hesablana bilər
        pendingApprovals: 8, // Mock data, real data ilə əvəz olunmalıdır
        pendingForms: [], // Doldurulmalıdır
        upcomingDeadlines,
        notifications: notifications || [],
        pendingSchools: schools.filter(s => s.status === 'pending').length || 0,
        approvedSchools: activeSchools,
        rejectedSchools: schools.filter(s => s.status === 'rejected').length || 0
      };
      
      console.log('SectorAdmin məlumatları hazırlandı:', sectorAdminData);
      setDashboardData(sectorAdminData);
      
    } catch (err: any) {
      console.error('SectorAdmin məlumatları əldə edilərkən xəta:', err);
      throw err;
    }
  };

  // SchoolAdmin üçün məlumatlar
  const fetchSchoolAdminData = async () => {
    try {
      console.log('SchoolAdmin məlumatları əldə edilir...');
      
      if (!user?.schoolId) {
        throw new Error('İstifadəçi üçün məktəb ID müəyyən edilməyib');
      }
      
      // Məktəb məlumatlarını əldə edirik
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('name, sector_id, region_id')
        .eq('id', user.schoolId)
        .single();
      
      if (schoolError) throw schoolError;
      
      // Sektor məlumatlarını əldə edirik
      const { data: sectorData, error: sectorError } = await supabase
        .from('sectors')
        .select('name')
        .eq('id', schoolData.sector_id)
        .single();
      
      if (sectorError) throw sectorError;
      
      // Region məlumatlarını əldə edirik
      const { data: regionData, error: regionError } = await supabase
        .from('regions')
        .select('name')
        .eq('id', schoolData.region_id)
        .single();
      
      if (regionError) throw regionError;
      
      // Kateqoriyaları əldə edirik
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, deadline, status')
        .eq('status', 'active')
        .order('priority', { ascending: true });
      
      if (categoriesError) throw categoriesError;
      
      // Data entries üçün statistika əldə edirik
      const { data: dataEntries, error: dataEntriesError } = await supabase
        .from('data_entries')
        .select('status')
        .eq('school_id', user.schoolId);
      
      if (dataEntriesError) throw dataEntriesError;
      
      // Bildirişləri əldə edirik
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (notificationsError) throw notificationsError;
      
      // Formlar üzrə statistika hesablayaq
      const pendingForms = dataEntries.filter(entry => entry.status === 'pending').length;
      const approvedForms = dataEntries.filter(entry => entry.status === 'approved').length;
      const rejectedForms = dataEntries.filter(entry => entry.status === 'rejected').length;
      
      // Tamamlanma faizi hesablayaq
      const completionRate = dataEntries.length > 0
        ? Math.round((approvedForms / dataEntries.length) * 100)
        : 0;
      
      // Gələcək tarixləri hazırlayaq
      const upcomingDeadlines = categories
        .filter(cat => cat.deadline)
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 5)
        .map(cat => ({
          category: cat.name,
          date: new Date(cat.deadline).toLocaleDateString('az-AZ')
        }));
      
      // Son dövriyyədə olan formların mock datası
      const recentFormItems: FormItem[] = [
        {
          id: "form-1",
          title: "Tədris planı",
          category: "Tədris",
          status: 'pending',
          completionPercentage: 75
        },
        {
          id: "form-2",
          title: "Müəllim məlumatları",
          category: "Kadr",
          status: 'approved',
          completionPercentage: 100
        }
      ];
      
      // SchoolAdmin dashboard məlumatlarını hazırlayaq
      const schoolAdminData: SchoolAdminDashboardData = {
        schoolName: schoolData.name,
        sectorName: sectorData.name,
        regionName: regionData.name,
        completionRate,
        forms: {
          pending: pendingForms,
          approved: approvedForms,
          rejected: rejectedForms,
          dueSoon: 2, // Mock data, real data ilə əvəz olunmalıdır
          overdue: 1 // Mock data, real data ilə əvəz olunmalıdır
        },
        totalForms: dataEntries.length,
        completedForms: approvedForms,
        rejectedForms,
        pendingForms: [], // Doldurulmalıdır
        upcomingDeadlines,
        recentForms: recentFormItems, // Bu hissə real data ilə əvəz edilməlidir
        notifications: notifications || []
      };
      
      console.log('SchoolAdmin məlumatları hazırlandı:', schoolAdminData);
      setDashboardData(schoolAdminData);
      
    } catch (err: any) {
      console.error('SchoolAdmin məlumatları əldə edilərkən xəta:', err);
      throw err;
    }
  };

  // Diaqram məlumatlarını hazırlayan funksiya
  const fetchChartData = async (role: string) => {
    try {
      console.log('Chart məlumatları əldə edilir...');
      
      // Aktivlik məlumatları
      const activityData = [
        { name: t('approved'), value: 65 },
        { name: t('pending'), value: 25 },
        { name: t('rejected'), value: 10 }
      ];
      
      // Region məktəbləri məlumatları
      let regionSchoolsData = [];
      
      // SuperAdmin və RegionAdmin üçün regionları əldə edirik
      if (role === 'superadmin' || role === 'regionadmin') {
        const { data: regions, error: regionsError } = await supabase
          .from('regions')
          .select('id, name')
          .eq('status', 'active');
        
        if (regionsError) throw regionsError;
        
        // Regionlar üzrə məktəbləri sayırıq
        const regionsWithSchools = await Promise.all(regions.slice(0, 5).map(async (region) => {
          const { data: schools, error: schoolsError } = await supabase
            .from('schools')
            .select('id')
            .eq('region_id', region.id);
          
          if (schoolsError) throw schoolsError;
          
          return {
            name: region.name,
            value: schools.length
          };
        }));
        
        regionSchoolsData = regionsWithSchools;
      } else {
        // SectorAdmin və SchoolAdmin üçün bəzi default məlumatlar
        regionSchoolsData = [
          { name: 'Bakı', value: 120 },
          { name: 'Sumqayıt', value: 75 }
        ];
      }
      
      // Kateqoriya tamamlanma məlumatları
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('status', 'active')
        .order('priority', { ascending: true })
        .limit(5);
      
      if (categoriesError) throw categoriesError;
      
      // Hər bir kateqoriya üçün tamamlanma nisbətini hazırlayaq
      const categoryCompletionData = categories.map(category => {
        // Real datada bu funksiya tamamlama faizini hesablaya bilər
        // Hələlik random dəyərlər istifadə edirik
        return {
          name: category.name,
          completed: 50 + Math.floor(Math.random() * 50) // 50-100 arası random dəyər
        };
      });
      
      // Chart məlumatlarını təyin edirik
      setChartData({
        activityData,
        regionSchoolsData,
        categoryCompletionData
      });
      
      console.log('Chart məlumatları hazırlandı');
      
    } catch (err: any) {
      console.error('Chart məlumatları əldə edilərkən xəta:', err);
      throw err;
    }
  };

  // useEffect hook-u ilə səhifə yüklənəndə məlumatları əldə edirik
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRoleBasedData().catch(err => {
        console.error('Dashboard məlumatları əldə edilərkən xəta:', err);
        setError(err instanceof Error ? err : new Error(err?.message || 'Bilinməyən xəta'));
      });
    }
  }, [isAuthenticated, user, fetchRoleBasedData]);

  return { 
    dashboardData, 
    isLoading, 
    error, 
    chartData, 
    userRole,
    refreshData: fetchRoleBasedData
  };
};

export default useSupabaseDashboardData;

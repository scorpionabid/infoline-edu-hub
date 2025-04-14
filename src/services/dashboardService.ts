import { supabase } from '@/integrations/supabase/client';
import { 
  SuperAdminDashboardData, 
  RegionAdminDashboardData, 
  SectorAdminDashboardData, 
  SchoolAdminDashboardData,
  DashboardNotification,
  ChartData,
  FormItem,
  StatsItem
} from '@/types/dashboard';
import { 
  createMockSuperAdminData, 
  createMockRegionAdminData, 
  createMockSectorAdminData,
  createMockSchoolAdminData
} from '@/utils/dashboardUtils';
import { dbNotificationToDashboardNotification } from '@/types/adapters';

/**
 * Dashboard qrafiklər məlumatlarını əldə edir
 */
export const fetchDashboardChartData = async (): Promise<ChartData> => {
  try {
    // API-dən real məlumatlar əldə edilə bilər
    // Hələlik mock data qaytarırıq
    return {
      activityData: [
        { name: 'Yanvar', value: 145 },
        { name: 'Fevral', value: 230 },
        { name: 'Mart', value: 275 },
        { name: 'Aprel', value: 310 },
        { name: 'May', value: 350 },
        { name: 'İyun', value: 420 },
        { name: 'İyul', value: 380 }
      ],
      regionSchoolsData: [
        { name: 'Bakı', value: 185 },
        { name: 'Sumqayıt', value: 76 },
        { name: 'Gəncə', value: 54 },
        { name: 'Mingəçevir', value: 28 },
        { name: 'Şirvan', value: 23 }
      ],
      categoryCompletionData: [
        { name: 'Şagird statistikası', completed: 85 },
        { name: 'Müəllim heyəti', completed: 72 },
        { name: 'İnfrastruktur', completed: 63 },
        { name: 'Tədris proqramı', completed: 91 },
        { name: 'İnzibati işlər', completed: 56 }
      ]
    };
  } catch (error) {
    console.error('Dashboard qrafik məlumatlarını əldə edərkən xəta:', error);
    return {
      activityData: [],
      regionSchoolsData: [],
      categoryCompletionData: []
    };
  }
};

/**
 * RegionAdmin dashboard məlumatlarını əldə edir
 * @param regionId Region ID
 */
export const fetchRegionAdminDashboard = async (regionId: string): Promise<RegionAdminDashboardData | null> => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id || '';

    // Sektorlar
    const { data: sectorData, error: sectorError } = await supabase
      .from('sectors')
      .select('id, name, completion_rate, school_count')
      .eq('region_id', regionId);

    if (sectorError) throw sectorError;

    // Bildirişlər
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (notificationsError) throw notificationsError;

    // Statistika (burada mock data istifadə olunur, çünki real məlumat yoxdur)
    const stats: StatsItem[] = [
      {
        id: '1',
        title: 'Ümumi məlumat doldurulma faizi',
        value: 78,
        change: 12,
        changeType: 'increase'
      },
      {
        id: '2',
        title: 'Bu ay əlavə edilən məlumatlar',
        value: 156,
        change: 8,
        changeType: 'increase'
      },
      {
        id: '3',
        title: 'Keçən aya nəzərən dəyişiklik',
        value: 23,
        change: 5,
        changeType: 'decrease'
      },
      {
        id: '4',
        title: 'Formların ortalama tamamlanma müddəti',
        value: 2.4,
        change: 0,
        changeType: 'neutral'
      }
    ];

    // Tip konversiyaları
    const dashboardNotifications: DashboardNotification[] = notificationsData
      ? notificationsData.map(dbNotificationToDashboardNotification)
      : [];

    const sectorCompletions = sectorData ? sectorData.map(sector => ({
      name: sector.name,
      completionRate: sector.completion_rate ?? 0,
      id: sector.id,
      schoolCount: sector.school_count ?? 0
    })) : [];

    return {
      sectors: 8,
      schools: 120,
      users: 145,
      completionRate: 72,
      pendingApprovals: 18,
      pendingSchools: 12,
      approvedSchools: 98,
      rejectedSchools: 10,
      notifications: dashboardNotifications,
      stats,
      categories: [
        {
          name: 'Şagird statistikası',
          completionRate: 85,
          color: '#4ade80',
          id: '1'
        },
        {
          name: 'Müəllim heyəti',
          completionRate: 72,
          color: '#facc15',
          id: '2'
        }
      ],
      sectorCompletions
    };
  } catch (error) {
    console.error('RegionAdmin dashboard məlumatları əldə edilərkən xəta:', error);
    return createMockRegionAdminData();
  }
};

/**
 * SectorAdmin dashboard məlumatlarını əldə edir
 * @param sectorId Sector ID
 */
export const fetchSectorAdminDashboard = async (sectorId: string): Promise<SectorAdminDashboardData | null> => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id || '';

    // Məktəblər
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .select('id, name, completion_rate')
      .eq('sector_id', sectorId);

    if (schoolError) throw schoolError;

    // Bildirişlər
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (notificationsError) throw notificationsError;

    // Statistika (burada mock data istifadə olunur, çünki real məlumat yoxdur)
    const stats: StatsItem[] = [
      {
        id: '1',
        title: 'Ümumi məlumat doldurulma faizi',
        value: 78,
        change: 12,
        changeType: 'increase'
      },
      {
        id: '2',
        title: 'Bu ay əlavə edilən məlumatlar',
        value: 156,
        change: 8,
        changeType: 'increase'
      },
      {
        id: '3',
        title: 'Keçən aya nəzərən dəyişiklik',
        value: 23,
        change: 5,
        changeType: 'decrease'
      },
      {
        id: '4',
        title: 'Formların ortalama tamamlanma müddəti',
        value: 2.4,
        change: 0,
        changeType: 'neutral'
      }
    ];

    // Tip konversiyaları
    const dashboardNotifications: DashboardNotification[] = notificationsData
      ? notificationsData.map(dbNotificationToDashboardNotification)
      : [];

    return {
      schools: 24,
      completionRate: 68,
      pendingApprovals: 12,
      pendingSchools: 8,
      approvedSchools: 14,
      rejectedSchools: 2,
      notifications: dashboardNotifications,
      stats,
      schoolStats: schoolData ? schoolData.map(school => ({
        id: school.id,
        name: school.name,
        completionRate: school.completion_rate ?? 0,
        pending: 0
      })) : [],
      pendingItems: [
        {
          id: '1',
          school: '20 nömrəli məktəb',
          category: 'Şagird statistikası',
          date: '2024-04-15'
        },
        {
          id: '2',
          school: '45 nömrəli məktəb',
          category: 'Müəllim heyəti',
          date: '2024-04-20'
        }
      ],
      categoryCompletion: [
        {
          name: 'Şagird statistikası',
          completionRate: 85,
          color: '#4ade80',
          id: '1'
        },
        {
          name: 'Müəllim heyəti',
          completionRate: 72,
          color: '#facc15',
          id: '2'
        }
      ],
      activityLog: [
        {
          id: '1',
          action: 'Məlumat əlavə edildi',
          target: 'Şagird statistikası',
          time: '10:30'
        },
        {
          id: '2',
          action: 'Məlumat təsdiqləndi',
          target: 'Müəllim heyəti',
          time: '14:45'
        }
      ]
    };
  } catch (error) {
    console.error('SectorAdmin dashboard məlumatları əldə edilərkən xəta:', error);
    return createMockSectorAdminData();
  }
};

/**
 * SuperAdmin dashboard məlumatlarını əldə edir
 */
export const fetchSuperAdminDashboard = async (): Promise<SuperAdminDashboardData | null> => {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id || '';

    // Bildirişlər
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (notificationsError) throw notificationsError;

    // Statistika (burada mock data istifadə olunur, çünki real məlumat yoxdur)
    const stats: StatsItem[] = [
      {
        id: '1',
        title: 'Ümumi məlumat doldurulma faizi',
        value: 78,
        change: 12,
        changeType: 'increase'
      },
      {
        id: '2',
        title: 'Bu ay əlavə edilən məlumatlar',
        value: 156,
        change: 8,
        changeType: 'increase'
      },
      {
        id: '3',
6 title: 'Keçən aya nəzərən dəyişiklik',
        value: 23,
        change: 5,
        changeType: 'decrease'
      },
      {
        id: '4',
        title: 'Formların ortalama tamamlanma müddəti',
        value: 2.4,
        change: 0,
        changeType: 'neutral'
      }
    ];

    // Tip konversiyaları
    const dashboardNotifications: DashboardNotification[] = notificationsData
      ? notificationsData.map(dbNotificationToDashboardNotification)
      : [];

    return {
      regions: 12,
      sectors: 48,
      schools: 645,
      users: 872,
      completionRate: 76,
      pendingApprovals: 34,
      notifications: dashboardNotifications,
      stats,
      formsByStatus: {
        pending: 78,
        approved: 542,
        rejected: 21
      },
      regionStats: [
        {
          id: '1',
          name: 'Bakı',
          sectorCount: 12,
          schoolCount: 185,
          completionRate: 82
        },
        {
          id: '2',
          name: 'Sumqayıt',
          sectorCount: 8,
          schoolCount: 76,
          completionRate: 74
        },
        {
          id: '3',
          name: 'Gəncə',
          sectorCount: 6,
          schoolCount: 54,
          completionRate: 68
        }
      ]
    };
  } catch (error) {
    console.error('SuperAdmin dashboard məlumatları əldə edilərkən xəta:', error);
    return createMockSuperAdminData();
  }
};

/**
 * SchoolAdmin dashboard məlumatlarını əldə edir
 * @param schoolId Məktəb ID
 */
export const fetchSchoolAdminDashboard = async (schoolId: string): Promise<SchoolAdminDashboardData | null> => {
  try {
    const { data: schoolData, error: schoolError } = await supabase
      .from('schools')
      .select('*, sectors(name), regions(name)')
      .eq('id', schoolId)
      .single();

    if (schoolError) throw schoolError;

    // Form statistikasını əldə et
    // Burada real data əldə etmək üçün sorğular əlavə edilə bilər
    
    // Bildirişləri əldə et
    const userId = (await supabase.auth.getUser()).data.user?.id || '';
    
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (notificationsError) throw notificationsError;

    // Kateqoriyaları əldə et
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('status', 'active');

    if (categoriesError) throw categoriesError;

    // Tip konversiyaları
    const dashboardNotifications: DashboardNotification[] = notificationsData
      ? notificationsData.map(dbNotificationToDashboardNotification)
      : [];

    // Mock data ilə birləşdir
    const mockData = createMockSchoolAdminData();
    
    return {
      forms: mockData.forms,
      completionRate: schoolData.completion_rate || 0,
      notifications: dashboardNotifications,
      pendingForms: categoriesData ? categoriesData.map(category => ({
        id: category.id,
        title: category.name,
        category: category.description || '',
        status: 'pending',
        completionPercentage: 0,
        date: category.deadline ? new Date(category.deadline).toISOString().split('T')[0] : '',
      })) : mockData.pendingForms
    };
  } catch (error) {
    console.error('SchoolAdmin dashboard məlumatları əldə edilərkən xəta:', error);
    return createMockSchoolAdminData();
  }
};

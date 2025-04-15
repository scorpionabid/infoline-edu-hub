
import { supabase } from '@/integrations/supabase/client';
import { 
  SuperAdminDashboardData, 
  RegionAdminDashboardData, 
  SectorAdminDashboardData, 
  SchoolAdminDashboardData, 
  ChartData 
} from '@/types/dashboard';
import { adaptNotificationToDashboard } from '@/types/adapters';

// SuperAdmin dashboard məlumatlarını əldə etmək üçün
export const getSuperAdminDashboardData = async (): Promise<SuperAdminDashboardData | null> => {
  try {
    // İlk mərhələdə RPC funksiyasından istifadə edirik
    // Bu funksiya bütün lazımi dashboard məlumatlarını bir sorğuda əldə edir
    const { data, error } = await supabase.rpc(
      'get_dashboard_data_superadmin',
      {}
    );

    if (error) {
      console.error('SuperAdmin dashboard məlumatlarını əldə edərkən xəta:', error);
      throw error;
    }

    // Əgər data null deyilsə, onu SuperAdminDashboardData tipinə çeviririk
    if (data) {
      const { regions, sectors, schools, users, regionStats, notifications, stats, pendingApprovals, completionRate } = data;

      // Bildirişləri dashboard formatına çeviririk
      const dashboardNotifications = notifications && Array.isArray(notifications)
        ? notifications.map(adaptNotificationToDashboard)
        : [];

      return {
        regions,
        sectors,
        schools,
        users,
        regionStats,
        completionRate,
        pendingApprovals,
        notifications: dashboardNotifications,
        stats: stats || [],
        formsByStatus: data.formsByStatus || {
          pending: 0,
          approved: 0,
          rejected: 0
        }
      };
    }

    return null;
  } catch (error) {
    console.error('SuperAdmin dashboard məlumatları əldə etmə xətası:', error);
    return null;
  }
};

// Region admin dashboard məlumatlarını əldə etmək üçün
export const getRegionAdminDashboardData = async (regionId: string): Promise<RegionAdminDashboardData | null> => {
  try {
    // Region id ilə RPC funksiyasını çağırırıq
    const { data, error } = await supabase.rpc(
      'get_dashboard_data_region',
      { p_region_id: regionId }
    );

    if (error) {
      console.error('Region admin dashboard məlumatlarını əldə edərkən xəta:', error);
      throw error;
    }

    // Əgər data null deyilsə, onu RegionAdminDashboardData tipinə çeviririk
    if (data) {
      const {
        sectors,
        schools,
        users,
        pendingSchools,
        approvedSchools,
        rejectedSchools,
        sectorCompletions,
        categories,
        notifications,
        stats,
        pendingApprovals,
        completionRate
      } = data;

      // Bildirişləri dashboard formatına çeviririk
      const dashboardNotifications = notifications && Array.isArray(notifications)
        ? notifications.map(adaptNotificationToDashboard)
        : [];

      return {
        sectors,
        schools,
        users,
        pendingSchools,
        approvedSchools,
        rejectedSchools,
        sectorCompletions,
        categories,
        completionRate,
        pendingApprovals,
        notifications: dashboardNotifications,
        stats: stats || [],
        formsByStatus: data.formsByStatus || {
          pending: 0,
          approved: 0,
          rejected: 0
        }
      };
    }

    return null;
  } catch (error) {
    console.error('Region admin dashboard məlumatları əldə etmə xətası:', error);
    return null;
  }
};

// Sektor admin dashboard məlumatlarını əldə etmək üçün
export const getSectorAdminDashboardData = async (sectorId: string): Promise<SectorAdminDashboardData | null> => {
  try {
    // Sektor id ilə RPC funksiyasını çağırırıq
    const { data, error } = await supabase.rpc(
      'get_dashboard_data_sector',
      { p_sector_id: sectorId }
    );

    if (error) {
      console.error('Sektor admin dashboard məlumatlarını əldə edərkən xəta:', error);
      throw error;
    }

    // Əgər data null deyilsə, onu SectorAdminDashboardData tipinə çeviririk
    if (data) {
      const {
        schools,
        pendingSchools,
        approvedSchools,
        rejectedSchools,
        schoolStats,
        pendingItems,
        activityLog,
        categoryCompletion,
        notifications,
        stats,
        pendingApprovals,
        completionRate
      } = data;

      // Bildirişləri dashboard formatına çeviririk
      const dashboardNotifications = notifications && Array.isArray(notifications)
        ? notifications.map(adaptNotificationToDashboard)
        : [];

      return {
        schools,
        pendingSchools,
        approvedSchools,
        rejectedSchools,
        schoolStats,
        pendingItems,
        activityLog,
        categoryCompletion,
        completionRate,
        pendingApprovals,
        notifications: dashboardNotifications,
        stats: stats || [],
        formsByStatus: data.formsByStatus || {
          pending: 0,
          approved: 0,
          rejected: 0
        }
      };
    }

    return null;
  } catch (error) {
    console.error('Sektor admin dashboard məlumatları əldə etmə xətası:', error);
    return null;
  }
};

// Məktəb admin dashboard məlumatlarını əldə etmək üçün
export const getSchoolAdminDashboardData = async (schoolId: string): Promise<SchoolAdminDashboardData | null> => {
  try {
    // İlk mərhələdə mock data istifadə edirik
    // Gələcəkdə bu real data ilə əvəz ediləcək
    
    // Məktəb id ilə database sorğusu
    // RPC funksiyası gələcəkdə əlavə ediləcək
    
    const formsByStatus = {
      pending: 5,
      approved: 10,
      rejected: 2,
      total: 17,
      dueSoon: 3,
      overdue: 1
    };

    // Mock notifications
    const notifications = [
      {
        id: '1',
        title: 'Yeni kateqoriya əlavə edildi',
        message: 'Təhsil Statistikası kateqoriyası əlavə edildi',
        type: 'category',
        isRead: false,
        priority: 'normal',
        date: '2023-09-15',
        time: '09:30',
        userId: 'user1',
        createdAt: '2023-09-15T09:30:00'
      },
      {
        id: '2',
        title: 'Tezliklə son tarix',
        message: 'Şagird məlumatları kateqoriyasının son tarixi 3 gün sonradır',
        type: 'deadline',
        isRead: false,
        priority: 'high',
        date: '2023-09-16',
        time: '10:15',
        userId: 'user1',
        createdAt: '2023-09-16T10:15:00'
      }
    ];

    // Mock pending forms
    const pendingForms = [
      {
        id: '1',
        title: 'Şagird Məlumatları',
        category: 'Tədris',
        date: '2023-09-30',
        status: 'pending',
        completionPercentage: 75
      },
      {
        id: '2',
        title: 'Müəllim Məlumatları',
        category: 'Kadrlar',
        date: '2023-10-05',
        status: 'dueSoon',
        completionPercentage: 30
      },
      {
        id: '3',
        title: 'İnfrastruktur',
        category: 'Maddi-texniki baza',
        date: '2023-09-25',
        status: 'overdue',
        completionPercentage: 10
      }
    ];

    return {
      forms: formsByStatus,
      pendingForms,
      completionRate: 60,
      pendingApprovals: 5,
      notifications,
      stats: [
        {
          id: '1',
          title: 'Tamamlanma faizi',
          value: 60,
          change: 5,
          changeType: 'increase'
        },
        {
          id: '2',
          title: 'Gözləyən formlar',
          value: 5,
          change: -2,
          changeType: 'decrease'
        }
      ],
      formsByStatus: {
        pending: formsByStatus.pending,
        approved: formsByStatus.approved,
        rejected: formsByStatus.rejected
      }
    };
  } catch (error) {
    console.error('Məktəb admin dashboard məlumatları əldə etmə xətası:', error);
    return null;
  }
};

// Chart məlumatları üçün
export const getChartData = async (): Promise<ChartData | null> => {
  try {
    // RPC çağırışı
    const { data, error } = await supabase.rpc(
      'get_activity_data_charts',
      {}
    );

    if (error) {
      console.error('Qrafik məlumatlarını əldə edərkən xəta:', error);
      throw error;
    }

    if (data) {
      return {
        activityData: data.activityData || [],
        regionSchoolsData: data.regionSchoolsData || [],
        categoryCompletionData: data.categoryCompletionData || []
      };
    }

    // Mock data
    return {
      activityData: [
        { name: 'Bazar ertəsi', value: 15 },
        { name: 'Çərşənbə axşamı', value: 25 },
        { name: 'Çərşənbə', value: 20 },
        { name: 'Cümə axşamı', value: 30 },
        { name: 'Cümə', value: 22 },
        { name: 'Şənbə', value: 10 },
        { name: 'Bazar', value: 5 }
      ],
      regionSchoolsData: [
        { name: 'Bakı', value: 120 },
        { name: 'Sumqayıt', value: 45 },
        { name: 'Gəncə', value: 60 },
        { name: 'Şəki', value: 25 },
        { name: 'Quba', value: 30 }
      ],
      categoryCompletionData: [
        { name: 'Şagird məlumatları', completed: 75 },
        { name: 'Müəllim məlumatları', completed: 60 },
        { name: 'Maddi-texniki baza', completed: 90 },
        { name: 'Tədris nəticələri', completed: 40 },
        { name: 'Maliyyə', completed: 50 }
      ]
    };
  } catch (error) {
    console.error('Qrafik məlumatları əldə etmə xətası:', error);
    return null;
  }
};

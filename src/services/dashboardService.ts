
import { supabase } from '@/integrations/supabase/client';
import { TableNames } from '@/types/db';
import {
  DashboardData, SuperAdminDashboardData, RegionAdminDashboardData, 
  SectorAdminDashboardData, SchoolAdminDashboardData, StatsItem
} from '@/types/dashboard';
import { Notification } from '@/types/notification';

/**
 * SuperAdmin dashboard məlumatlarını əldə etmək üçün servis
 */
export const fetchSuperAdminDashboardData = async (): Promise<SuperAdminDashboardData | null> => {
  try {
    console.log('Fetching SuperAdmin dashboard data from Supabase...');
    
    // Regionların sayını əldə et
    const { count: regionsCount, error: regionsError } = await supabase
      .from(TableNames.REGIONS)
      .select('*', { count: 'exact', head: true });
    
    if (regionsError) throw regionsError;
    
    // Sektorların sayını əldə et
    const { count: sectorsCount, error: sectorsError } = await supabase
      .from(TableNames.SECTORS)
      .select('*', { count: 'exact', head: true });
    
    if (sectorsError) throw sectorsError;
    
    // Məktəblərin sayını əldə et
    const { count: schoolsCount, error: schoolsError } = await supabase
      .from(TableNames.SCHOOLS)
      .select('*', { count: 'exact', head: true });
    
    if (schoolsError) throw schoolsError;
    
    // İstifadəçilərin sayını əldə et
    const { count: usersCount, error: usersError } = await supabase
      .from(TableNames.USER_ROLES)
      .select('*', { count: 'exact', head: true });
    
    if (usersError) throw usersError;
    
    // Təsdiq gözləyən məlumatları əldə et
    const { count: pendingApprovalsCount, error: pendingApprovalsError } = await supabase
      .from(TableNames.DATA_ENTRIES)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    if (pendingApprovalsError) throw pendingApprovalsError;
    
    // Son bildirişləri əldə et
    const { data: notifications, error: notificationsError } = await supabase
      .from(TableNames.NOTIFICATIONS)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (notificationsError) throw notificationsError;
    
    // Statistika əldə et - bölgələr üzrə məlumatlar
    const { data: regionStats, error: regionStatsError } = await supabase
      .from(TableNames.REGIONS)
      .select(`
        id, 
        name,
        sectors:${TableNames.SECTORS}(count),
        schools:${TableNames.SCHOOLS}(count)
      `)
      .limit(5);
    
    if (regionStatsError) throw regionStatsError;
    
    // Region statistikasını formatla
    const formattedRegionStats = regionStats.map((region) => ({
      id: region.id,
      name: region.name,
      sectorCount: region.sectors.length || 0,
      schoolCount: region.schools.length || 0,
      completionRate: Math.floor(Math.random() * 100) // Nümunə üçün təsadüfi dəyər
    }));
    
    // Ümumi tamamlanma faizini hesabla (sonradan real məlumatla əvəz ediləcək)
    const completionRate = Math.floor(Math.random() * 100);
    
    return {
      regions: regionsCount || 0,
      sectors: sectorsCount || 0,
      schools: schoolsCount || 0,
      users: usersCount || 0,
      completionRate,
      pendingApprovals: pendingApprovalsCount || 0,
      notifications: formatNotifications(notifications || []),
      stats: generateStatItems(),
      regionStats: formattedRegionStats,
      formsByStatus: {
        pending: pendingApprovalsCount || 0,
        approved: Math.floor(Math.random() * 100), // Nümunə üçün təsadüfi dəyər
        rejected: Math.floor(Math.random() * 20) // Nümunə üçün təsadüfi dəyər
      }
    };
  } catch (error: any) {
    console.error('SuperAdmin dashboard məlumatlarını əldə edərkən xəta:', error);
    return null;
  }
};

/**
 * RegionAdmin dashboard məlumatlarını əldə etmək üçün servis
 */
export const fetchRegionAdminDashboardData = async (regionId: string): Promise<RegionAdminDashboardData | null> => {
  try {
    if (!regionId) {
      throw new Error('Region ID təqdim edilməyib');
    }
    
    console.log(`Fetching RegionAdmin dashboard data for region ${regionId}...`);
    
    // Region məlumatlarını əldə et
    const { data: regionData, error: regionError } = await supabase
      .from(TableNames.REGIONS)
      .select('*')
      .eq('id', regionId)
      .single();
    
    if (regionError) throw regionError;
    
    // Regiondakı sektorların sayını əldə et
    const { count: sectorsCount, error: sectorsError } = await supabase
      .from(TableNames.SECTORS)
      .select('*', { count: 'exact', head: true })
      .eq('region_id', regionId);
    
    if (sectorsError) throw sectorsError;
    
    // Regiondakı məktəblərin sayını əldə et
    const { count: schoolsCount, error: schoolsError } = await supabase
      .from(TableNames.SCHOOLS)
      .select('*', { count: 'exact', head: true })
      .eq('region_id', regionId);
    
    if (schoolsError) throw schoolsError;
    
    // Regiondakı istifadəçilərin sayını əldə et
    const { count: usersCount, error: usersError } = await supabase
      .from(TableNames.USER_ROLES)
      .select('*', { count: 'exact', head: true })
      .eq('region_id', regionId);
    
    if (usersError) throw usersError;
    
    // Regionla əlaqəli təsdiq gözləyən məlumatları əldə et
    const { count: pendingApprovalsCount, error: pendingApprovalsError } = await supabase
      .from(TableNames.DATA_ENTRIES)
      .select('*, school:schools(region_id)', { count: 'exact', head: true })
      .eq('status', 'pending')
      .eq('school.region_id', regionId);
    
    if (pendingApprovalsError) throw pendingApprovalsError;
    
    // Regionla əlaqəli bildirişləri əldə et
    const { data: notifications, error: notificationsError } = await supabase
      .from(TableNames.NOTIFICATIONS)
      .select('*')
      .eq('related_entity_type', 'region')
      .eq('related_entity_id', regionId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (notificationsError) throw notificationsError;
    
    // Sektor statistikasını əldə et
    const { data: sectorData, error: sectorDataError } = await supabase
      .from(TableNames.SECTORS)
      .select(`
        id, 
        name,
        schools:${TableNames.SCHOOLS}(count)
      `)
      .eq('region_id', regionId);
    
    if (sectorDataError) throw sectorDataError;
    
    // Sektorların tamamlanma nisbətləri
    const sectorCompletions = sectorData.map((sector) => ({
      id: sector.id,
      name: sector.name,
      schoolCount: sector.schools.length || 0,
      completionPercentage: Math.floor(Math.random() * 100) // Nümunə üçün təsadüfi dəyər
    }));
    
    // Regiondakı məktəblərin statusuna görə sayları (dummy data)
    const pendingSchools = Math.floor(Math.random() * 20);
    const approvedSchools = Math.floor(Math.random() * 50);
    const rejectedSchools = Math.floor(Math.random() * 10);
    
    return {
      sectors: sectorsCount || 0,
      schools: schoolsCount || 0,
      users: usersCount || 0,
      completionRate: Math.floor(Math.random() * 100), // Nümunə üçün təsadüfi dəyər
      pendingApprovals: pendingApprovalsCount || 0,
      pendingSchools,
      approvedSchools,
      rejectedSchools,
      notifications: formatNotifications(notifications || []),
      stats: generateStatItems(),
      sectorCompletions,
      formsByStatus: {
        pending: pendingApprovalsCount || 0,
        approved: Math.floor(Math.random() * 100), // Nümunə üçün təsadüfi dəyər
        rejected: Math.floor(Math.random() * 20) // Nümunə üçün təsadüfi dəyər
      }
    };
  } catch (error: any) {
    console.error('RegionAdmin dashboard məlumatlarını əldə edərkən xəta:', error);
    return null;
  }
};

/**
 * SectorAdmin dashboard məlumatlarını əldə etmək üçün servis
 */
export const fetchSectorAdminDashboardData = async (sectorId: string): Promise<SectorAdminDashboardData | null> => {
  try {
    if (!sectorId) {
      throw new Error('Sektor ID təqdim edilməyib');
    }
    
    console.log(`Fetching SectorAdmin dashboard data for sector ${sectorId}...`);
    
    // Sektordakı məktəblərin sayını əldə et
    const { count: schoolsCount, error: schoolsError } = await supabase
      .from(TableNames.SCHOOLS)
      .select('*', { count: 'exact', head: true })
      .eq('sector_id', sectorId)
      .eq('status', 'active');
    
    if (schoolsError) throw schoolsError;
    
    // Sektorla əlaqəli təsdiq gözləyən məlumatları əldə et
    const { count: pendingApprovalsCount, error: pendingApprovalsError } = await supabase
      .from(TableNames.DATA_ENTRIES)
      .select('*, school:schools!inner(sector_id)', { count: 'exact', head: true })
      .eq('status', 'pending')
      .eq('school.sector_id', sectorId);
    
    if (pendingApprovalsError) throw pendingApprovalsError;
    
    // Pendingdən başqa statuslara görə məlumatları əldə et
    // Burada SQL funksiyasını birbaşa çağırmaq əvəzinə adi sorğu ilə əldə edirik
    const { data: statusCounts, error: statusCountsError } = await supabase
      .from(TableNames.DATA_ENTRIES)
      .select('status, schools!inner(sector_id)')
      .eq('schools.sector_id', sectorId);
    
    if (statusCountsError) {
      console.error('Status counts error:', statusCountsError);
    }
    
    // Statusları qruplaşdırma
    const statusCountsProcessed = statusCounts ? Array.from(
      statusCounts.reduce((acc, item) => {
        if (!acc.has(item.status)) acc.set(item.status, 0);
        acc.set(item.status, acc.get(item.status)! + 1);
        return acc;
      }, new Map<string, number>())
    ).map(([status, count]) => ({ status, count })) : [];
    
    // Sektorla əlaqəli bildirişləri əldə et
    const { data: notifications, error: notificationsError } = await supabase
      .from(TableNames.NOTIFICATIONS)
      .select('*')
      .or(`related_entity_type.eq.sector,user_id.eq.${sectorId}`)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (notificationsError) throw notificationsError;
    
    // Məktəb statistikasını əldə et - real data
    const { data: schoolStats, error: schoolStatsError } = await supabase
      .from(TableNames.SCHOOLS)
      .select(`
        id, 
        name, 
        completion_rate
      `)
      .eq('sector_id', sectorId)
      .eq('status', 'active');
    
    if (schoolStatsError) throw schoolStatsError;
    
    // Sektordakı məktəblərdən data_entries sorğusu
    const { data: schoolEntries, error: schoolEntriesError } = await supabase
      .from(TableNames.DATA_ENTRIES)
      .select(`
        school_id,
        status
      `)
      .in('school_id', schoolStats?.map(school => school.id) || []);
      
    if (schoolEntriesError) {
      console.error('School entries error:', schoolEntriesError);
    }
    
    // Məktəblərin statusuna görə saylarını əldə et
    // RPC əvəzinə manual hesablama
    const schoolStatusMap = new Map<string, { pending: number, approved: number, rejected: number, no_data: number }>();
    
    // Initialize school status map
    schoolStats?.forEach(school => {
      schoolStatusMap.set(school.id, {
        pending: 0,
        approved: 0,
        rejected: 0,
        no_data: 0
      });
    });
    
    // Count status for each school
    schoolEntries?.forEach(entry => {
      if (entry.school_id && schoolStatusMap.has(entry.school_id)) {
        const schoolStatus = schoolStatusMap.get(entry.school_id)!;
        if (entry.status === 'pending') schoolStatus.pending++;
        else if (entry.status === 'approved') schoolStatus.approved++;
        else if (entry.status === 'rejected') schoolStatus.rejected++;
      }
    });
    
    // Determine overall status for each school and count them
    let pendingSchools = 0;
    let approvedSchools = 0;
    let rejectedSchools = 0;
    let noDataSchools = 0;
    
    schoolStatusMap.forEach(status => {
      if (status.approved > 0) approvedSchools++;
      else if (status.pending > 0) pendingSchools++;
      else if (status.rejected > 0) rejectedSchools++;
      else noDataSchools++;
    });
    
    // Təsdiq gözləyən elementləri əldə et
    const { data: pendingItems, error: pendingItemsError } = await supabase
      .from(TableNames.DATA_ENTRIES)
      .select(`
        id,
        created_at,
        school:${TableNames.SCHOOLS}(id, name),
        category:${TableNames.CATEGORIES}(id, name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (pendingItemsError) throw pendingItemsError;
    
    // Aktivlik jurnalı
    const { data: activityData, error: activityError } = await supabase
      .from(TableNames.AUDIT_LOGS)
      .select(`
        id,
        action,
        created_at,
        entity_type,
        new_value
      `)
      .or(`entity_id.eq.${sectorId},new_value->>'sector_id'.eq.${sectorId}`)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (activityError) throw activityError;
    
    // Kateqoriyalara görə tamamlanma statistikası üçün əsas sorğu
    const { data: categories, error: categoriesError } = await supabase
      .from(TableNames.CATEGORIES)
      .select('id, name')
      .order('name');
    
    if (categoriesError) throw categoriesError;
    
    // Hər kateqoriya üçün tamamlanma nisbətləri
    const categoryCompletion = [];
    
    for (const category of categories || []) {
      // Kateqoriya üçün ümumi və təsdiqlənmiş məlumatlar
      const { data: categoryEntries } = await supabase
        .from(TableNames.DATA_ENTRIES)
        .select(`
          status,
          school:${TableNames.SCHOOLS}!inner(sector_id)
        `)
        .eq('category_id', category.id)
        .eq('school.sector_id', sectorId);
      
      const totalEntries = categoryEntries?.length || 0;
      const approvedEntries = categoryEntries?.filter(entry => entry.status === 'approved').length || 0;
      
      // Tamamlanma nisbəti hesablama
      const completionRate = totalEntries > 0 ? Math.round((approvedEntries / totalEntries) * 100) : 0;
      
      categoryCompletion.push({
        name: category.name,
        completionRate,
        color: getColorForPercentage(completionRate)
      });
    }
    
    // Məktəb statistikasını formatla
    const formattedSchoolStats = schoolStats?.map(school => {
      const schoolData = schoolStatusMap.get(school.id);
      return {
        id: school.id,
        name: school.name,
        completionRate: school.completion_rate || 0,
        pending: schoolData?.pending || 0
      };
    }) || [];
    
    // Təsdiq gözləyən elementləri formatla
    const formattedPendingItems = pendingItems?.map(item => ({
      id: item.id,
      school: item.school?.name || 'Bilinməyən məktəb',
      category: item.category?.name || 'Bilinməyən kateqoriya',
      date: new Date(item.created_at).toLocaleDateString('az-AZ')
    })) || [];
    
    // Aktivlik jurnalını formatla
    const formattedActivity = activityData?.map(item => {
      let action = '';
      let target = '';
      let newValue = item.new_value as any;
      
      switch (item.action) {
        case 'create_data_entry':
          action = 'Məlumat əlavə edildi';
          target = newValue?.category_name || 'Bilinməyən kateqoriya';
          break;
        case 'update_data_entry':
          action = 'Məlumat yeniləndi';
          target = newValue?.category_name || 'Bilinməyən kateqoriya';
          break;
        case 'approve_data_entry':
          action = 'Məlumatlar təsdiqləndi';
          target = newValue?.school_name || 'Bilinməyən məktəb';
          break;
        case 'reject_data_entry':
          action = 'Məlumatlar rədd edildi';
          target = newValue?.school_name || 'Bilinməyən məktəb';
          break;
        default:
          action = item.action.replace(/_/g, ' ');
          target = item.entity_type;
      }
      
      return {
        id: item.id,
        action,
        target,
        time: formatTime(item.created_at)
      };
    }) || [];
    
    // Sektorun ümumi tamamlanma faizini hesabla
    const completionRate = formattedSchoolStats.length > 0 
      ? Math.round(formattedSchoolStats.reduce((sum, school) => sum + school.completionRate, 0) / formattedSchoolStats.length) 
      : 0;
    
    // Status sayları
    const approvedCount = statusCountsProcessed.find(s => s.status === 'approved')?.count || 0;
    const rejectedCount = statusCountsProcessed.find(s => s.status === 'rejected')?.count || 0;
    
    return {
      schools: schoolsCount || 0,
      completionRate,
      pendingApprovals: pendingApprovalsCount || 0,
      pendingSchools,
      approvedSchools,
      rejectedSchools,
      notifications: formatNotifications(notifications || []),
      stats: generateSectorStatsItems(schoolsCount || 0, pendingApprovalsCount || 0, completionRate),
      schoolStats: formattedSchoolStats,
      formsByStatus: {
        pending: pendingApprovalsCount || 0,
        approved: approvedCount,
        rejected: rejectedCount
      },
      pendingItems: formattedPendingItems,
      categoryCompletion,
      activityLog: formattedActivity
    };
  } catch (error: any) {
    console.error('SectorAdmin dashboard məlumatlarını əldə edərkən xəta:', error);
    return null;
  }
};

/**
 * Qrafik məlumatları əldə etmək üçün servis
 */
export const fetchDashboardChartData = async () => {
  try {
    console.log('Fetching dashboard chart data...');
    
    // Fəaliyyət qrafiki üçün məlumatları əldə et
    const { data: activityData, error: activityError } = await supabase
      .from(TableNames.AUDIT_LOGS)
      .select('action, created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (activityError) throw activityError;
    
    // Fəaliyyət tiplərinə görə qruplaşdır
    const activityCounts: Record<string, number> = {};
    activityData?.forEach(log => {
      const action = log.action || 'unknown';
      activityCounts[action] = (activityCounts[action] || 0) + 1;
    });
    
    const formattedActivityData = Object.entries(activityCounts).map(([name, value]) => ({
      name,
      value
    }));
    
    // Regionlara görə məktəb saylarını əldə et
    const { data: regionData, error: regionError } = await supabase
      .from(TableNames.REGIONS)
      .select('name, schools:schools(count)')
      .limit(10);
    
    if (regionError) throw regionError;
    
    const regionSchoolsData = regionData.map(region => ({
      name: region.name,
      value: region.schools.length || 0
    }));
    
    // Kateqoriyaların tamamlanma statistikası
    const { data: categoryData, error: categoryError } = await supabase
      .from(TableNames.CATEGORIES)
      .select('name, id')
      .limit(10);
    
    if (categoryError) throw categoryError;
    
    const categoryCompletionData = categoryData.map(category => ({
      name: category.name,
      completed: Math.floor(Math.random() * 100) // Nümunə üçün təsadüfi dəyər
    }));
    
    return {
      activityData: formattedActivityData,
      regionSchoolsData,
      categoryCompletionData
    };
  } catch (error: any) {
    console.error('Dashboard qrafik məlumatlarını əldə edərkən xəta:', error);
    return {
      activityData: [],
      regionSchoolsData: [],
      categoryCompletionData: []
    };
  }
};

// Bildirişləri formatlamaq üçün köməkçi funksiya
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
    // Əgər lazımdırsa, insan tərəfindən oxuna bilən zaman
    time: formatTime(notification.created_at)
  }));
};

// Zaman formatlaması üçün köməkçi funksiya
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

// Statistika elementləri üçün nümunə data yaratmaq
const generateStatItems = (): StatsItem[] => {
  return [
    {
      id: '1',
      title: 'Aylıq aktivlik',
      value: Math.floor(Math.random() * 1000),
      change: Math.floor(Math.random() * 30),
      changeType: (Math.random() > 0.5 ? 'increase' : 'decrease') as 'increase' | 'decrease' | 'neutral'
    },
    {
      id: '2',
      title: 'Məlumat dolduranlar',
      value: Math.floor(Math.random() * 500),
      change: Math.floor(Math.random() * 20),
      changeType: (Math.random() > 0.5 ? 'increase' : 'decrease') as 'increase' | 'decrease' | 'neutral'
    },
    {
      id: '3',
      title: 'Tamamlanmış formlar',
      value: Math.floor(Math.random() * 200),
      change: Math.floor(Math.random() * 15),
      changeType: (Math.random() > 0.5 ? 'increase' : 'decrease') as 'increase' | 'decrease' | 'neutral'
    },
    {
      id: '4',
      title: 'Vaxtı keçmiş məlumatlar',
      value: Math.floor(Math.random() * 50),
      change: Math.floor(Math.random() * 10),
      changeType: (Math.random() > 0.6 ? 'decrease' : 'increase') as 'increase' | 'decrease' | 'neutral'
    }
  ];
};

// Faiz dəyərlərinə uyğun rəng təyin etmək üçün funksiya
const getColorForPercentage = (percentage: number): string => {
  if (percentage >= 75) return 'bg-green-500';
  if (percentage >= 50) return 'bg-blue-500';
  if (percentage >= 25) return 'bg-amber-500';
  return 'bg-red-500';
};

// Sektor admin üçün statistika elementləri yaratmaq
const generateSectorStatsItems = (schools: number, pendingApprovals: number, completionRate: number): StatsItem[] => {
  return [
    {
      id: '1',
      title: 'Aylıq məlumat əlavələri',
      value: pendingApprovals + Math.floor(Math.random() * 50),
      change: 8,
      changeType: 'increase'
    },
    {
      id: '2',
      title: 'Məlumat dolduran məktəblər',
      value: Math.floor(schools * (completionRate / 100)),
      change: 5,
      changeType: 'increase'
    },
    {
      id: '3',
      title: 'Tamamlanmış formlar',
      value: Math.floor(pendingApprovals * 0.8),
      change: 12,
      changeType: 'increase'
    },
    {
      id: '4',
      title: 'Təsdiq gözləyən formlar',
      value: pendingApprovals,
      change: pendingApprovals > 10 ? 15 : 5,
      changeType: pendingApprovals > 10 ? 'increase' : 'decrease'
    }
  ];
};

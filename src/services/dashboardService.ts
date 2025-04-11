
import { DashboardData, StatsItem } from '@/types/dashboard';
import { generateRandomId } from '@/utils/helpers';
import { 
  getLatestNotifications, 
  getNotificationsByRegion, 
  getNotificationsBySector 
} from './notificationService';
import {
  getCompletedFormsCount,
  getPendingFormsCount,
  getTotalFormsCount,
  getPendingFormsCountBySector
} from './formService';
import {
  getRegionsCount,
  getCompletedFormsCountByRegion,
  getPendingFormsCountByRegion,
  getTotalFormsCountByRegion,
  getSectorsCountByRegion,
  getSchoolsCountByRegion,
  getUsersCountByRegion
} from './regionService';
import {
  getSectorsCount,
  getCompletedFormsCountBySector,
  getTotalFormsCountBySector,
  getSchoolsCountBySector
} from './sectorService';
import {
  getSchoolsCount
} from './schoolService';
import {
  getAllUsersCount
} from './userService';

// SuperAdmin üçün dashboard məlumatlarını əldə et
export const fetchSuperAdminDashboardData = async (): Promise<DashboardData> => {
  try {
    // Əsas statistika məlumatlarını əldə edək
    const [
      regionsCount,
      sectorsCount,
      schoolsCount,
      usersCount,
      completedFormsCount,
      pendingApprovalCount
    ] = await Promise.all([
      getRegionsCount(),
      getSectorsCount(),
      getSchoolsCount(),
      getAllUsersCount(),
      getCompletedFormsCount(),
      getPendingFormsCount()
    ]);
    
    // Bildirişləri əldə edək
    const notifications = await getLatestNotifications();
    
    // Tamamlanma faizi hesablayaq
    const totalForms = await getTotalFormsCount();
    const completionRate = totalForms > 0 
      ? Math.round((completedFormsCount / totalForms) * 100) 
      : 0;
      
    // Statistika elementləri üçün artım/azalma simulyasiyası
    const statsItems: StatsItem[] = [
      {
        id: generateRandomId(),
        title: 'Ümumi Regionlar',
        value: regionsCount,
        change: 0,
        changeType: 'neutral'
      },
      {
        id: generateRandomId(),
        title: 'Ümumi Sektorlar',
        value: sectorsCount,
        change: 5,
        changeType: 'increase'
      },
      {
        id: generateRandomId(),
        title: 'Ümumi Məktəblər',
        value: schoolsCount,
        change: 10,
        changeType: 'increase'
      },
      {
        id: generateRandomId(),
        title: 'Ümumi İstifadəçilər',
        value: usersCount,
        change: 8,
        changeType: 'increase'
      }
    ];
    
    return {
      regions: regionsCount,
      sectors: sectorsCount,
      schools: schoolsCount,
      users: usersCount,
      completionRate,
      pendingApprovals: pendingApprovalCount,
      notifications,
      stats: statsItems
    };
  } catch (error) {
    console.error('SuperAdmin dashboard məlumatları əldə edilərkən xəta:', error);
    throw error;
  }
};

// RegionAdmin üçün dashboard məlumatlarını əldə et
export const fetchRegionAdminDashboardData = async (regionId: string): Promise<DashboardData> => {
  try {
    // Əsas statistika məlumatlarını əldə edək
    const [
      sectorsCount,
      schoolsCount,
      usersCount,
      completedFormsCount,
      pendingApprovalCount
    ] = await Promise.all([
      getSectorsCountByRegion(regionId),
      getSchoolsCountByRegion(regionId),
      getUsersCountByRegion(regionId),
      getCompletedFormsCountByRegion(regionId),
      getPendingFormsCountByRegion(regionId)
    ]);
    
    // Bildirişləri əldə edək
    const notifications = await getNotificationsByRegion(regionId);
    
    // Tamamlanma faizi hesablayaq
    const totalForms = await getTotalFormsCountByRegion(regionId);
    const completionRate = totalForms > 0 
      ? Math.round((completedFormsCount / totalForms) * 100) 
      : 0;
      
    // Statistika elementləri üçün artım/azalma simulyasiyası
    const statsItems: StatsItem[] = [
      {
        id: generateRandomId(),
        title: 'Ümumi Sektorlar',
        value: sectorsCount,
        change: 2,
        changeType: 'increase'
      },
      {
        id: generateRandomId(),
        title: 'Ümumi Məktəblər',
        value: schoolsCount,
        change: 5,
        changeType: 'increase'
      },
      {
        id: generateRandomId(),
        title: 'Ümumi İstifadəçilər',
        value: usersCount,
        change: 3,
        changeType: 'increase'
      },
      {
        id: generateRandomId(),
        title: 'Tamamlanma Faizi',
        value: completionRate,
        change: 15,
        changeType: 'increase'
      }
    ];
    
    return {
      sectors: sectorsCount,
      schools: schoolsCount,
      users: usersCount,
      completionRate,
      pendingApprovals: pendingApprovalCount,
      notifications,
      stats: statsItems
    };
  } catch (error) {
    console.error('RegionAdmin dashboard məlumatları əldə edilərkən xəta:', error);
    throw error;
  }
};

// SectorAdmin üçün dashboard məlumatlarını əldə et
export const fetchSectorAdminDashboardData = async (sectorId: string): Promise<DashboardData> => {
  try {
    // Əsas statistika məlumatlarını əldə edək
    const [
      schoolsCount,
      completedFormsCount,
      pendingApprovalCount
    ] = await Promise.all([
      getSchoolsCountBySector(sectorId),
      getCompletedFormsCountBySector(sectorId),
      getPendingFormsCountBySector(sectorId)
    ]);
    
    // Bildirişləri əldə edək
    const notifications = await getNotificationsBySector(sectorId);
    
    // Tamamlanma faizi hesablayaq
    const totalForms = await getTotalFormsCountBySector(sectorId);
    const completionRate = totalForms > 0 
      ? Math.round((completedFormsCount / totalForms) * 100) 
      : 0;
      
    // Statistika elementləri üçün artım/azalma simulyasiyası
    const statsItems: StatsItem[] = [
      {
        id: generateRandomId(),
        title: 'Ümumi Məktəblər',
        value: schoolsCount,
        change: 3,
        changeType: 'increase'
      },
      {
        id: generateRandomId(),
        title: 'Tamamlanma Faizi',
        value: completionRate,
        change: 10,
        changeType: 'increase'
      },
      {
        id: generateRandomId(),
        title: 'Gözləyən Təsdiqlər',
        value: pendingApprovalCount,
        change: 5,
        changeType: 'decrease'
      },
      {
        id: generateRandomId(),
        title: 'Yeni Məlumatlar',
        value: totalForms,
        change: 8,
        changeType: 'increase'
      }
    ];
    
    return {
      schools: schoolsCount,
      completionRate,
      pendingApprovals: pendingApprovalCount,
      notifications,
      stats: statsItems
    };
  } catch (error) {
    console.error('SectorAdmin dashboard məlumatları əldə edilərkən xəta:', error);
    throw error;
  }
};

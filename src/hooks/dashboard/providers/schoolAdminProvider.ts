
import { getBaseData } from './baseProvider';
import { getMockNotifications, getMockRecentForms } from '../mockDashboardData';
import { SchoolAdminDashboardData, FormItem } from '@/types/dashboard';

export function getSchoolAdminData(): SchoolAdminDashboardData {
  const baseData = getBaseData();
  const notifications = getMockNotifications().map(n => ({
    ...n, 
    time: n.createdAt || new Date().toISOString() 
  }));
  
  const recentForms = getMockRecentForms();
  
  return {
    ...baseData,
    schoolName: "Şəhər Məktəbi #1",
    sectorName: "Nəsimi",
    regionName: "Bakı",
    forms: {
      pending: 3,
      approved: 10,
      rejected: 1,
      dueSoon: 2,
      overdue: 0
    },
    completionRate: 80,
    notifications,
    totalForms: 15,
    completedForms: 10,
    rejectedForms: 2,
    dueDates: [
      { category: "Tədris planı", date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() },
      { category: "Maliyyə hesabatı", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    recentForms
  };
}

import { ActivityItem, FormItem } from '@/types/dashboard';
import { FormStatus } from '@/types/form';

const getMockActivities = (): ActivityItem[] => {
  return [
    {
      id: '1',
      type: 'update', // ActivityItem tipinə 'type' əlavə etdik
      title: 'İstifadəçi məlumatları yeniləndi', // title əlavə etdik
      description: 'Admin istifadəçi məlumatları yenilədi', // description əlavə etdik
      action: 'Yeniləmə',
      actor: 'Admin',
      target: 'İstifadəçi',
      time: '2 saat əvvəl',
      userId: 'admin-1', // userId əlavə etdik
      timestamp: new Date().toISOString() // timestamp əlavə etdik
    },
  ];
};

const getRecentForms = (): FormItem[] => {
  return [
    {
      id: '1',
      title: 'Şagirdlər haqqında məlumatlar',
      status: 'pending' as FormStatus,
      completionPercentage: 35,
      deadline: '2023-05-15',
      categoryId: 'cat-1', // categoryId əlavə etdik
      filledCount: 3, // filledCount əlavə etdik
      totalCount: 10 // totalCount əlavə etdik
    },
  ];
};

const getDueSoonForms = (): FormItem[] => {
  return [
    {
      id: '2',
      title: 'Müəllimlər haqqında məlumatlar',
      status: 'dueSoon' as FormStatus,
      completionPercentage: 65,
      deadline: '2023-05-10',
      categoryId: 'cat-2', // categoryId əlavə etdik
      filledCount: 7, // filledCount əlavə etdik
      totalCount: 10 // totalCount əlavə etdik
    },
  ];
};

const getOverdueForms = (): FormItem[] => {
  return [
    {
      id: '3',
      title: 'Ümumi məlumatlar',
      status: 'overdue' as FormStatus,
      completionPercentage: 95,
      deadline: '2023-04-30',
      categoryId: 'cat-3', // categoryId əlavə etdik
      filledCount: 9, // filledCount əlavə etdik
      totalCount: 10 // totalCount əlavə etdik
    },
  ];
};

const getCompletedForms = (): FormItem[] => {
  return [
    {
      id: '4',
      title: 'Digər məlumatlar',
      status: 'approved' as FormStatus,
      completionPercentage: 100,
      deadline: '2023-04-25',
      categoryId: 'cat-4', // categoryId əlavə etdik
      filledCount: 10, // filledCount əlavə etdik
      totalCount: 10 // totalCount əlavə etdik
    },
  ];
};

export const baseDashboardData = {
  activityData: getMockActivities(),
  recentForms: getRecentForms(),
  dueSoonForms: getDueSoonForms(),
  overdueForms: getOverdueForms(),
  completedForms: getCompletedForms()
};

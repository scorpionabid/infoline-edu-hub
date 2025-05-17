
import { CategoryItem, DeadlineItem, FormItem, SchoolAdminDashboardData, DashboardFormStats } from '@/types/dashboard';

// Example implementation of dashboard data for the school admin
export const mockSchoolAdminDashboardData: SchoolAdminDashboardData = {
  completion: {
    percentage: 68,
    total: 25,
    completed: 17
  },
  status: {
    pending: 5,
    approved: 17,
    rejected: 2,
    draft: 1,
    total: 25
  },
  formStats: {
    pending: 5,
    approved: 17,
    rejected: 2,
    draft: 1,
    dueSoon: 3,
    overdue: 2,
    total: 25,
    completed: 17,
    percentage: 68
  },
  categories: [
    {
      id: 'cat1',
      name: 'Məktəb haqqında ümumi məlumat',
      completionRate: 100,
      status: 'completed',
      description: 'Məktəb haqqında əsas məlumatlar'
    },
    {
      id: 'cat2',
      name: 'Müəllimlər və şagirdlər',
      completionRate: 75,
      status: 'in-progress',
      description: 'Müəllim və şagird məlumatları'
    },
    {
      id: 'cat3',
      name: 'İnfrastruktur',
      completionRate: 30,
      status: 'in-progress',
      description: 'Məktəb infrastrukturu haqqında'
    },
    {
      id: 'cat4',
      name: 'Tədris planı',
      completionRate: 0,
      status: 'not-started',
      description: 'Tədris planı və proqramlar'
    }
  ],
  pendingForms: [
    {
      id: 'form1',
      title: 'Müəllimlərin siyahısı',
      status: 'pending',
      categoryName: 'Müəllimlər və şagirdlər',
      categoryId: 'cat2',
      deadline: new Date(2023, 6, 15).toISOString()
    },
    {
      id: 'form2',
      title: 'Məktəb infrastrukturu',
      status: 'draft',
      categoryName: 'İnfrastruktur',
      categoryId: 'cat3',
      deadline: new Date(2023, 7, 10).toISOString()
    },
    {
      id: 'form3',
      title: 'Şagirdlərin nəticələri',
      status: 'pending',
      categoryName: 'Müəllimlər və şagirdlər',
      categoryId: 'cat2',
      deadline: new Date(2023, 7, 25).toISOString()
    }
  ],
  upcoming: [
    {
      id: 'deadline1',
      title: 'İnfrastruktur məlumatlarının doldurulması',
      categoryId: 'cat3',
      categoryName: 'İnfrastruktur',
      deadline: new Date(2023, 6, 30).toISOString(),
      daysLeft: 5,
      status: 'pending'
    },
    {
      id: 'deadline2',
      title: 'Şagird nəticələrinin yüklənməsi',
      categoryId: 'cat2',
      categoryName: 'Müəllimlər və şagirdlər',
      deadline: new Date(2023, 7, 15).toISOString(),
      daysLeft: 20,
      status: 'not-started'
    }
  ]
};

// Example deadline items
export const mockDeadlineItems: DeadlineItem[] = [
  {
    id: 'deadline1',
    title: 'İnfrastruktur məlumatları',
    categoryName: 'İnfrastruktur',
    deadline: new Date(2023, 6, 30).toISOString(),
    daysLeft: 5
  },
  {
    id: 'deadline2',
    title: 'Müəllim məlumatları',
    categoryName: 'Müəllimlər və şagirdlər',
    deadline: new Date(2023, 7, 10).toISOString(),
    daysLeft: 15
  },
  {
    id: 'deadline3',
    title: 'Tədris planı',
    categoryName: 'Tədris planı',
    deadline: new Date(2023, 8, 5).toISOString(),
    daysLeft: 40
  }
];

// Example form items
export const mockFormItems: FormItem[] = [
  {
    id: 'form1',
    title: 'Məktəb infrastrukturu',
    categoryName: 'İnfrastruktur',
    status: 'pending',
    deadline: new Date(2023, 6, 30).toISOString()
  },
  {
    id: 'form2',
    title: 'Müəllimlər siyahısı',
    categoryName: 'Müəllimlər və şagirdlər',
    status: 'draft',
    deadline: new Date(2023, 7, 10).toISOString()
  },
  {
    id: 'form3',
    title: 'Şagirdlərin sayı',
    categoryName: 'Müəllimlər və şagirdlər',
    status: 'pending',
    deadline: new Date(2023, 7, 15).toISOString()
  },
  {
    id: 'form4',
    title: 'Tədris planı',
    categoryName: 'Tədris planı',
    status: 'not-started',
    deadline: new Date(2023, 8, 5).toISOString()
  }
];

// Example categories
export const mockCategories: CategoryItem[] = [
  {
    id: 'cat1',
    name: 'Məktəb haqqında ümumi məlumat',
    completionRate: 100,
    status: 'completed',
    description: 'Məktəb haqqında əsas məlumatlar'
  },
  {
    id: 'cat2',
    name: 'Müəllimlər və şagirdlər',
    completionRate: 75,
    status: 'in-progress',
    description: 'Müəllim və şagird məlumatları'
  },
  {
    id: 'cat3',
    name: 'İnfrastruktur',
    completionRate: 30,
    status: 'in-progress',
    description: 'Məktəb infrastrukturu haqqında'
  },
  {
    id: 'cat4',
    name: 'Tədris planı',
    completionRate: 0,
    status: 'not-started',
    description: 'Tədris planı və proqramlar'
  }
];

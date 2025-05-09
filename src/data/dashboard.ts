
import { CategoryItem, DeadlineItem, FormItem, SchoolStat } from '@/types/dashboard';

export const generateMockDashboardData = () => {
  return {
    status: {
      pending: 12,
      approved: 45,
      rejected: 3,
      draft: 8,
      total: 68,
      active: 57,
      inactive: 11
    },
    formStats: {
      pending: 12,
      approved: 45,
      rejected: 3,
      draft: 8,
      dueSoon: 5,
      overdue: 2,
      total: 68
    },
    completion: {
      total: 68,
      completed: 45,
      percentage: 66
    },
    completionRate: 66,
    schools: [
      { id: '1', name: 'School 1', completionRate: 75, status: 'active', pendingForms: 3, formsCompleted: 18, totalForms: 24 },
      { id: '2', name: 'School 2', completionRate: 50, status: 'active', pendingForms: 12, formsCompleted: 12, totalForms: 24 },
      { id: '3', name: 'School 3', completionRate: 25, status: 'inactive', pendingForms: 6, formsCompleted: 6, totalForms: 24 },
      { id: '4', name: 'School 4', completionRate: 100, status: 'active', pendingForms: 0, formsCompleted: 24, totalForms: 24 }
    ] as SchoolStat[],
    categories: [
      { id: '1', name: 'Category 1', completionRate: 75, status: 'active' },
      { id: '2', name: 'Category 2', completionRate: 50, status: 'active' },
      { id: '3', name: 'Category 3', completionRate: 25, status: 'draft' },
      { id: '4', name: 'Category 4', completionRate: 100, status: 'approved' }
    ] as CategoryItem[],
    upcoming: [
      { id: '1', title: 'Deadline 1', deadline: '2023-12-31', daysLeft: 10, categoryId: '1' },
      { id: '2', title: 'Deadline 2', deadline: '2023-12-25', daysLeft: 5, categoryId: '2' },
      { id: '3', title: 'Deadline 3', deadline: '2023-12-20', daysLeft: 2, categoryId: '3' }
    ] as DeadlineItem[],
    pendingForms: [
      { id: '1', title: 'Form 1', categoryName: 'Category 1', status: 'pending' },
      { id: '2', title: 'Form 2', categoryName: 'Category 2', status: 'pending' },
      { id: '3', title: 'Form 3', categoryName: 'Category 3', status: 'pending' }
    ] as FormItem[]
  };
};

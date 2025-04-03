
import { FormStatus, FormItem } from '@/types/form';
import { ActivityItem } from '@/types/dashboard';

// Nümunə məlumatları gətirmək üçün funksiyalar
export const getMockCategoryCompletion = () => {
  return [
    { name: 'Ümumi məlumatlar', completion: 85 },
    { name: 'Şagird məlumatları', completion: 65 },
    { name: 'Müəllim məlumatları', completion: 40 },
    { name: 'İnfrastruktur', completion: 25 },
    { name: 'Təhsil proqramı', completion: 50 },
  ];
};

export const getCategoryCompletionData = () => {
  return getMockCategoryCompletion();
};

export const getMockStatusDistribution = () => {
  return [
    { status: 'pending', count: 12 },
    { status: 'approved', count: 45 },
    { status: 'rejected', count: 8 },
    { status: 'overdue', count: 3 },
    { status: 'dueSoon', count: 7 },
  ];
};

export const getMockActivityData = (): ActivityItem[] => {
  return [
    {
      id: '1',
      type: 'form-submitted',
      title: "Form təqdim edildi",
      description: "Şagird məlumatları formu təqdim edildi",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      userId: "user-1",
      action: "submitted",
      actor: "Məktəb direktoru",
      target: "Şagird məlumatları formu",
      time: "30 dəqiqə əvvəl"
    },
    {
      id: '2',
      type: 'form-approved',
      title: "Form təsdiqləndi",
      description: "Müəllim məlumatları formu təsdiqləndi",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      userId: "user-2",
      action: "approved",
      actor: "Sektor müdiri",
      target: "Müəllim məlumatları formu",
      time: "2 saat əvvəl"
    },
    {
      id: '3',
      type: 'form-rejected',
      title: "Form rədd edildi",
      description: "İnfrastruktur məlumatları formu rədd edildi",
      timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      userId: "user-3",
      action: "rejected",
      actor: "Sektor müdiri",
      target: "İnfrastruktur məlumatları formu",
      time: "4 saat əvvəl"
    }
  ];
};

export const getMockPendingForms = (): FormItem[] => {
  return [
    {
      id: "form-1",
      title: "Şagird məlumatları",
      status: "pending" as FormStatus,
      categoryId: "cat-2",
      completionPercentage: 85,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
      filledCount: 5,
      totalCount: 6
    },
    {
      id: "form-2",
      title: "Müəllim məlumatları",
      status: "pending" as FormStatus,
      categoryId: "cat-3",
      completionPercentage: 65,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
      filledCount: 3,
      totalCount: 5
    },
    {
      id: "form-3",
      title: "İnfrastruktur məlumatları",
      status: "pending" as FormStatus,
      categoryId: "cat-4",
      completionPercentage: 40,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      filledCount: 4,
      totalCount: 10
    }
  ];
};

export const getMockApprovedForms = (): FormItem[] => {
  return [
    {
      id: "form-5",
      title: "Ümumi məlumatlar",
      status: "approved" as FormStatus,
      categoryId: "cat-1",
      completionPercentage: 100,
      deadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      filledCount: 6,
      totalCount: 6
    },
    {
      id: "form-6",
      title: "Təhsil proqramı məlumatları",
      status: "approved" as FormStatus,
      categoryId: "cat-5",
      completionPercentage: 100,
      deadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      filledCount: 5,
      totalCount: 5
    }
  ];
};

export const getMockRejectedForms = (): FormItem[] => {
  return [
    {
      id: "form-7",
      title: "Sənəd məlumatları",
      status: "rejected" as FormStatus,
      categoryId: "cat-6",
      completionPercentage: 80,
      deadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      filledCount: 4,
      totalCount: 5
    }
  ];
};

export const getMockRecentForms = (): FormItem[] => {
  return [
    {
      id: "form-1",
      title: "Şagird məlumatları",
      status: "pending" as FormStatus,
      categoryId: "cat-2",
      completionPercentage: 85,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
      filledCount: 5,
      totalCount: 6
    },
    {
      id: "form-5",
      title: "Ümumi məlumatlar",
      status: "approved" as FormStatus,
      categoryId: "cat-1",
      completionPercentage: 100,
      deadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      filledCount: 6,
      totalCount: 6
    },
    {
      id: "form-7",
      title: "Sənəd məlumatları",
      status: "rejected" as FormStatus,
      categoryId: "cat-6",
      completionPercentage: 80,
      deadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      filledCount: 4,
      totalCount: 5
    }
  ];
};

export const getMockUpcomingDeadlines = (): FormItem[] => {
  return [
    {
      id: "form-1",
      title: "Şagird məlumatları",
      status: "pending" as FormStatus,
      categoryId: "cat-2",
      completionPercentage: 85,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
      filledCount: 5,
      totalCount: 6
    },
    {
      id: "form-2",
      title: "Müəllim məlumatları",
      status: "pending" as FormStatus,
      categoryId: "cat-3",
      completionPercentage: 65,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
      filledCount: 3,
      totalCount: 5
    }
  ];
};

export const generateMockFormItems = (count: number): FormItem[] => {
  const statuses: FormStatus[] = ['pending', 'approved', 'rejected', 'overdue', 'dueSoon'];
  const titles = [
    'Şagird məlumatları',
    'Müəllim məlumatları',
    'İnfrastruktur məlumatları',
    'Ümumi məlumatlar',
    'Təhsil proqramı məlumatları',
    'Sənəd məlumatları',
    'Büdcə məlumatları',
    'Nailiyyətlər məlumatları'
  ];
  
  const result: FormItem[] = [];
  
  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const completionPercentage = Math.floor(Math.random() * 100);
    const totalCount = Math.floor(Math.random() * 10) + 5;
    const filledCount = Math.floor((completionPercentage / 100) * totalCount);
    
    result.push({
      id: `form-${i + 10}`,
      title,
      status,
      categoryId: `cat-${i + 1}`,
      completionPercentage,
      deadline: new Date(Date.now() + (Math.random() * 1000 * 60 * 60 * 24 * 10)).toISOString(),
      filledCount,
      totalCount
    });
  }
  
  return result;
};

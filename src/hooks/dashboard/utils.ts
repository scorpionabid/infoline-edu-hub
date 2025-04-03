
// Dashboard üçün utility funksiyaları

/**
 * Kateqoriya tamamlanma dərəcəsini təmsil edən dummy data yaradır.
 */
export const getMockCategoryCompletion = () => {
  return [
    { name: 'Ümumi məlumatlar', completed: 85 },
    { name: 'Müəllim məlumatları', completed: 65 },
    { name: 'İnfrastruktur', completed: 40 },
    { name: 'Akademik nəticələr', completed: 75 },
    { name: 'Şagird fəaliyyəti', completed: 50 }
  ];
};

/**
 * Boş recentForms dummy datası qaytarır.
 */
export const getMockRecentForms = () => {
  return [];
};

/**
 * Boş pendingForms dummy datası qaytarır.
 */
export const getMockPendingForms = () => {
  return [];
};

/**
 * Kateqoriya tamamlanma dərəcəsi üçün dummy data yaradır.
 */
export const getCategoryCompletionData = () => {
  return getMockCategoryCompletion();
};

/**
 * Son tarix yaxınlaşan formları təmsil edən dummy data yaradır.
 */
export const getMockUpcomingDeadlines = () => {
  return [];
};

/**
 * Activity datası üçün dummy məlumatlar yaradır
 */
export const getMockActivityData = () => {
  return [
    {
      id: "1",
      type: "form_submission",
      title: "Forma təqdim edildi",
      description: "Müəllim məlumatları forması təqdim edildi",
      timestamp: new Date().toISOString(),
      userId: "user1",
      action: "Təqdim edildi",
      actor: "İstifadəçi 1",
      target: "Forma 1", 
      time: "5 dəqiqə öncə"
    },
    {
      id: "2",
      type: "form_approval",
      title: "Forma təsdiqləndi",
      description: "İnfrastruktur forması təsdiqləndi",
      timestamp: new Date().toISOString(),
      userId: "user2",
      action: "Təsdiqləndi",
      actor: "İstifadəçi 2",
      target: "Forma 2",
      time: "1 saat öncə"
    },
    {
      id: "3",
      type: "form_rejection",
      title: "Forma rədd edildi",
      description: "Şagird fəaliyyəti forması rədd edildi",
      timestamp: new Date().toISOString(),
      userId: "user3",
      action: "Rədd edildi",
      actor: "İstifadəçi 3",
      target: "Forma 3",
      time: "3 saat öncə"
    }
  ];
};

/**
 * Safe FormItem yaratmaq üçün funksiya
 */
export const createSafeFormItems = (count: number = 3) => {
  const statuses = ['pending', 'approved', 'rejected', 'overdue', 'dueSoon'] as const;
  const items = [];
  
  for (let i = 0; i < count; i++) {
    items.push({
      id: `form-${i+1}`,
      title: `Form #${i+1}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      completionPercentage: Math.floor(Math.random() * 100),
      deadline: new Date(Date.now() + Math.floor(Math.random() * 10) * 86400000).toISOString(),
      categoryId: `cat-${i+1}`,
      filledCount: Math.floor(Math.random() * 10),
      totalCount: 10
    });
  }
  
  return items;
};

/**
 * Deadlineları stringə çevirmək üçün utility
 */
export const transformDeadlineToString = (deadline: Date | string | undefined): string => {
  if (!deadline) return '';
  const date = typeof deadline === 'string' ? new Date(deadline) : deadline;
  return date.toISOString();
};

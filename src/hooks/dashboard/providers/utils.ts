
import { FormItem, FormStatus } from '@/types/form';
import { ActivityItem } from '@/types/dashboard';

// Formlar üçün köməkçi funksiyalar
export const createSafeFormItems = (count: number = 3): FormItem[] => {
  const statuses: FormStatus[] = ['pending', 'approved', 'rejected', 'dueSoon', 'overdue', 'draft', 'inProgress'];
  
  return Array(count).fill(null).map((_, idx) => ({
    id: `form-${idx + 1}`,
    title: `Form ${idx + 1}`,
    categoryId: `cat-${idx % 3 + 1}`,
    status: statuses[idx % statuses.length],
    completionPercentage: Math.floor(Math.random() * 100),
    deadline: new Date(Date.now() + (idx + 1) * 86400000).toISOString(),
    filledCount: Math.floor(Math.random() * 10),
    totalCount: 10
  }));
};

// Fəaliyyətlər üçün köməkçi funksiya
export const createSafeActivityItems = (count: number = 5): ActivityItem[] => {
  const actions = ["created", "updated", "approved", "rejected", "deleted", "submitted"];
  const types = ["form", "category", "user", "school", "notification"];
  
  return Array(count).fill(null).map((_, idx) => {
    const actionIndex = idx % actions.length;
    const typeIndex = Math.floor(idx / 2) % types.length;
    const action = actions[actionIndex];
    const type = types[typeIndex];
    
    return {
      id: `activity-${idx}`,
      type: type,
      title: `${action} ${type}`,
      description: `User performed ${action} on ${type}`,
      timestamp: new Date(Date.now() - idx * 3600000).toISOString(),
      userId: `user-${idx % 3 + 1}`,
      action: action,
      actor: `User ${idx % 3 + 1}`,
      target: `${type}-${idx + 1}`,
      time: `${idx + 1}h ago`
    };
  });
};

// String formatında deadline təqdim etmək üçün funksiya
export const transformDeadlineToString = (deadline: string | Date): string => {
  if (!deadline) return '';
  
  try {
    const date = typeof deadline === 'string' ? new Date(deadline) : deadline;
    return date.toISOString();
  } catch (error) {
    console.error('Invalid date format for deadline:', deadline);
    return '';
  }
};

export const getSafeFormStatus = (status?: string): FormStatus => {
  const validStatuses: FormStatus[] = ['pending', 'approved', 'rejected', 'dueSoon', 'overdue', 'draft', 'inProgress'];
  
  if (!status || !validStatuses.includes(status as FormStatus)) {
    return 'pending';
  }
  
  return status as FormStatus;
};

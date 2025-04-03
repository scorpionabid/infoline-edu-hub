
import { FormItem } from '@/types/form';
import { FormStatus } from '@/types/form';

// Status-a görə formları filtirləmək üçün funksiya
export const filterFormsByStatus = (forms: FormItem[], status: FormStatus): FormItem[] => {
  return forms.filter(form => form.status === status);
};

// Ad-a görə formları filtirləmək üçün funksiya
export const filterFormsByName = (forms: FormItem[], query: string): FormItem[] => {
  if (!query) return forms;
  const lowerQuery = query.toLowerCase();
  return forms.filter(form => form.title.toLowerCase().includes(lowerQuery));
};

// Vaxtına görə formları sort etmək üçün funksiya
export const sortFormsByDueDate = (forms: FormItem[], ascending: boolean = true): FormItem[] => {
  return [...forms].sort((a, b) => {
    const dateA = a.deadline ? new Date(a.deadline).getTime() : 0;
    const dateB = b.deadline ? new Date(b.deadline).getTime() : 0;
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

// Tamamlanma dərəcəsinə görə formları sort etmək üçün funksiya
export const sortFormsByCompletion = (forms: FormItem[], ascending: boolean = false): FormItem[] => {
  return [...forms].sort((a, b) => {
    return ascending
      ? a.completionPercentage - b.completionPercentage
      : b.completionPercentage - a.completionPercentage;
  });
};

// Ad-a görə formları sort etmək üçün funksiya
export const sortFormsByName = (forms: FormItem[], ascending: boolean = true): FormItem[] => {
  return [...forms].sort((a, b) => {
    if (ascending) {
      return a.title.localeCompare(b.title);
    } else {
      return b.title.localeCompare(a.title);
    }
  });
};

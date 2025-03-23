
import { CategoryWithColumns } from '@/types/column';
import { createDemoCategory, createTeachersDemoCategory } from './createDemoCategory';

/**
 * Kateqoriyaları deadline və əhəmiyyət dərəcəsinə görə sıralayır
 */
export const sortCategories = (categories: CategoryWithColumns[]): CategoryWithColumns[] => {
  return [...categories].sort((a, b) => {
    // Əvvəlcə deadline-a görə sıralama
    if (a.deadline && b.deadline) {
      const deadlineA = new Date(a.deadline);
      const deadlineB = new Date(b.deadline);
      return deadlineA.getTime() - deadlineB.getTime();
    } else if (a.deadline) {
      return -1; // a-nın deadline-ı var, öndə olmalıdır
    } else if (b.deadline) {
      return 1; // b-nin deadline-ı var, öndə olmalıdır
    }
    return 0;
  });
};

/**
 * Mövcud kateqoriyaları demo kateqoriyalarla birləşdirir
 */
export const combineWithDemoCategories = (existingCategories: CategoryWithColumns[]): CategoryWithColumns[] => {
  const combinedCategories = [...existingCategories];
  
  // Əgər mövcud kateqoriyalar 2-dən azdırsa, demo kateqoriyaları əlavə edirik
  if (existingCategories.length < 2) {
    combinedCategories.push(createDemoCategory(), createTeachersDemoCategory());
  }
  
  return combinedCategories;
};

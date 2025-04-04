
import { CategoryWithColumns } from '@/types/column';
import { createDemoCategories, createTeachersDemoCategory } from './createDemoCategory';

// Kateqoriyaları tarixin yeni olmasına görə sıralayır
export const sortCategoriesByDate = (categories: CategoryWithColumns[]): CategoryWithColumns[] => {
  return [...categories].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // Ən yeni olandan başlayaraq
  });
};

// Kateqoriyaları prioritetə görə sıralayır
export const sortCategoriesByPriority = (categories: CategoryWithColumns[]): CategoryWithColumns[] => {
  return [...categories].sort((a, b) => a.priority - b.priority);
};

// Status filtrinə görə kateqoriyaları filtrləyir
export const filterCategoriesByStatus = (categories: CategoryWithColumns[], status: string): CategoryWithColumns[] => {
  if (!status || status === 'all') return categories;
  return categories.filter(cat => cat.status === status);
};

// Təyinata görə kateqoriyaları filtrləyir
export const filterCategoriesByAssignment = (categories: CategoryWithColumns[], assignment: 'all' | 'sectors'): CategoryWithColumns[] => {
  if (!assignment) return categories;
  return categories.filter(cat => cat.assignment === assignment);
};

// Axtarış sorğusuna görə kateqoriyaları filtrləyir
export const filterCategoriesBySearchQuery = (categories: CategoryWithColumns[], query: string): CategoryWithColumns[] => {
  if (!query) return categories;
  const lowercaseQuery = query.toLowerCase();
  return categories.filter(
    cat => 
      cat.name.toLowerCase().includes(lowercaseQuery) || 
      (cat.description && cat.description.toLowerCase().includes(lowercaseQuery))
  );
};

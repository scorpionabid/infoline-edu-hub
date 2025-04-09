
import { CategoryWithColumns } from '@/types/column';

// Kateqoriyaları sıralamaq üçün funksiyalar
export const sortCategoriesByPriority = (categories: CategoryWithColumns[]): CategoryWithColumns[] => {
  return [...categories].sort((a, b) => a.priority - b.priority);
};

export const sortCategoriesByCreationDate = (categories: CategoryWithColumns[]): CategoryWithColumns[] => {
  return [...categories].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
};

export const sortCategoriesByName = (categories: CategoryWithColumns[]): CategoryWithColumns[] => {
  return [...categories].sort((a, b) => a.name.localeCompare(b.name));
};

// Kateqoriyaları filtrlə
export const filterActiveCategories = (categories: CategoryWithColumns[]): CategoryWithColumns[] => {
  return categories.filter(category => category.status === 'active');
};

export const filterCategoriesByAssignment = (categories: CategoryWithColumns[], assignment: 'all' | 'sectors'): CategoryWithColumns[] => {
  return categories.filter(category => category.assignment === assignment);
};

export const filterCategoriesByStatus = (categories: CategoryWithColumns[], status: string): CategoryWithColumns[] => {
  if (status === 'all') return categories;
  return categories.filter(category => category.status === status);
};

export const filterCategoriesByDeadline = (categories: CategoryWithColumns[], deadlineType: 'upcoming' | 'past' | 'all'): CategoryWithColumns[] => {
  if (deadlineType === 'all') return categories;
  
  const today = new Date();
  
  if (deadlineType === 'upcoming') {
    return categories.filter(category => {
      if (!category.deadline) return false;
      return new Date(category.deadline) >= today;
    });
  } else {
    return categories.filter(category => {
      if (!category.deadline) return false;
      return new Date(category.deadline) < today;
    });
  }
};

// Kateqoriyaları ad və təsvirə görə axtar
export const searchCategories = (categories: CategoryWithColumns[], searchTerm: string): CategoryWithColumns[] => {
  if (!searchTerm) return categories;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return categories.filter(category => 
    category.name.toLowerCase().includes(lowerSearchTerm) || 
    (category.description && category.description.toLowerCase().includes(lowerSearchTerm))
  );
};

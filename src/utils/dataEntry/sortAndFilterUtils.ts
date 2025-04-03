
import { CategoryWithColumns, Column } from '@/types/column';
import { createDemoCategory, createDemoCategories, createTeachersDemoCategory } from './createDemoCategory';

// Function to sort categories by priority
export const sortCategoriesByPriority = (categories: CategoryWithColumns[]): CategoryWithColumns[] => {
  return [...categories].sort((a, b) => a.priority - b.priority);
};

// Function to sort categories by name
export const sortCategoriesByName = (categories: CategoryWithColumns[]): CategoryWithColumns[] => {
  return [...categories].sort((a, b) => a.name.localeCompare(b.name));
};

// Function to filter categories by status
export const filterCategoriesByStatus = (categories: CategoryWithColumns[], status: string): CategoryWithColumns[] => {
  return categories.filter(category => category.status === status);
};

// Function to filter categories by assignment
export const filterCategoriesByAssignment = (categories: CategoryWithColumns[], assignment: 'all' | 'sectors'): CategoryWithColumns[] => {
  return categories.filter(category => category.assignment === assignment);
};

// Function to search categories by name
export const searchCategoriesByName = (categories: CategoryWithColumns[], searchTerm: string): CategoryWithColumns[] => {
  const term = searchTerm.toLowerCase();
  return categories.filter(category => 
    category.name.toLowerCase().includes(term) || 
    (category.description && category.description.toLowerCase().includes(term))
  );
};

export default {
  sortCategoriesByPriority,
  sortCategoriesByName,
  filterCategoriesByStatus,
  filterCategoriesByAssignment,
  searchCategoriesByName,
  createDemoCategories,
  createTeachersDemoCategory
};

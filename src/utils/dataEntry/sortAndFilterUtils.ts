
import { CategoryWithColumns } from "@/types/column";
import { FormStatus } from "@/types/dashboard";
import { createDemoCategory, createTeachersDemoCategory, createDemoCategories } from "./createDemoCategory";

export const sortCategoriesByPriority = (categories: CategoryWithColumns[]) => {
  return [...categories].sort((a, b) => {
    // Əgər hər ikisinin prioriteti varsa, prioritet əsasında sıralayaq
    if (a.priority !== undefined && b.priority !== undefined) {
      return b.priority - a.priority;
    }
    // Əgər Sadəcə a-nın prioriteti varsa, a-nı üstə qoymaq
    if (a.priority !== undefined) {
      return -1;
    }
    // Əgər Sadəcə b-nin prioriteti varsa, b-ni üstə qoyaq
    if (b.priority !== undefined) {
      return 1;
    }
    // Order-a görə sıralayaq əgər varsa
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    // Default olaraq adla sıralamaq
    return (a.name || '').localeCompare(b.name || '');
  });
};

export const getCategoryStatus = (category: CategoryWithColumns): FormStatus => {
  // son tarix keçibsə
  if (category.deadline) {
    const now = new Date();
    const deadlineDate = new Date(category.deadline);
    
    if (deadlineDate < now) {
      return 'overdue';
    }
    
    // Son tarixə 3 gün qalıb
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);
    
    if (deadlineDate <= threeDaysFromNow) {
      return 'dueSoon';
    }
  }
  
  // Digər statuslar (pending, approved, rejected və s.) sistemdən gəlməlidir
  // Burada sadəcə default status qaytarırıq
  return 'pending';
};

export const filterCategoriesByStatus = (categories: CategoryWithColumns[], statusFilter: string): CategoryWithColumns[] => {
  if (!statusFilter || statusFilter === 'all') {
    return categories;
  }
  
  return categories.filter(category => {
    if (statusFilter === 'pending') {
      return getCategoryStatus(category) === 'pending';
    } else if (statusFilter === 'approved') {
      return getCategoryStatus(category) === 'approved';
    } else if (statusFilter === 'rejected') {
      return getCategoryStatus(category) === 'rejected';
    } else if (statusFilter === 'dueSoon') {
      return getCategoryStatus(category) === 'dueSoon';
    } else if (statusFilter === 'overdue') {
      return getCategoryStatus(category) === 'overdue';
    }
    return true;
  });
};


import { CategoryWithColumns } from '@/types/column';
import { CategoryEntryData } from '@/types/dataEntry';

/**
 * URL parametrdən form statusu əldə edir
 */
export const getFormStatusFromParams = (queryParams: URLSearchParams): 'draft' | 'submitted' | 'approved' | 'rejected' => {
  const statusParam = queryParams.get('status');
  
  if (statusParam === 'submitted') {
    return 'submitted';
  } else if (statusParam === 'approved') {
    return 'approved';
  } else if (statusParam === 'rejected') {
    return 'rejected';
  }
  
  return 'draft';
};

/**
 * Form statusuna görə ilkin məlumatları hazırlayır
 */
export const prepareEntriesBasedOnStatus = (
  entries: CategoryEntryData[], 
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
): CategoryEntryData[] => {
  if (status === 'draft') {
    return entries;
  }
  
  // Entries-in kopiyasını yaradırıq
  const updatedEntries = JSON.parse(JSON.stringify(entries)) as CategoryEntryData[];
  
  if (status === 'submitted') {
    // Bütün entries-ləri submitted edirik
    updatedEntries.forEach(entry => {
      entry.isSubmitted = true;
    });
  } else if (status === 'approved') {
    // Bütün entries-ləri approved edirik
    updatedEntries.forEach(entry => {
      entry.isSubmitted = true;
      entry.approvalStatus = 'approved';
    });
  } else if (status === 'rejected') {
    // Bütün entries-ləri rejected edirik
    updatedEntries.forEach(entry => {
      entry.isSubmitted = true;
      entry.approvalStatus = 'rejected';
      
      // Random xəta mesajları əlavə edirik (real mühitdə API-dən gələcək)
      if (entry.values.length > 0) {
        const randomValueIndex = Math.floor(Math.random() * entry.values.length);
        entry.values[randomValueIndex].errorMessage = "Bu dəyər uyğun deyil, zəhmət olmasa yenidən yoxlayın";
      }
    });
  }
  
  return updatedEntries;
};

/**
 * Kateqoriya ID-sinə görə indeks tapır
 */
export const findCategoryIndex = (categories: CategoryWithColumns[], categoryId: string | null): number => {
  if (!categoryId) return 0;
  
  const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
  return categoryIndex !== -1 ? categoryIndex : 0;
};

/**
 * Təcili və ya son müddəti keçmiş kateqoriya indeksini tapır
 */
export const findUrgentCategoryIndex = (categories: CategoryWithColumns[]): number => {
  const now = new Date();
  const threeDaysLater = new Date(now);
  threeDaysLater.setDate(now.getDate() + 3);

  const overdueOrUrgentCategoryIndex = categories.findIndex(category => {
    if (!category.deadline) return false;
    const deadlineDate = new Date(category.deadline);
    return deadlineDate <= threeDaysLater;
  });

  return overdueOrUrgentCategoryIndex !== -1 ? overdueOrUrgentCategoryIndex : 0;
};

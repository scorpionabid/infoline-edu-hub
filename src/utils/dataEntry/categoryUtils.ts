
import { CategoryWithColumns } from "@/types/column";
import { CategoryEntryData, DataEntryForm } from "@/types/dataEntry";

/**
 * Kateqoriya üçün yeni başlıq hazırlayır
 * 
 * @param category Kateqoriya obyekti
 * @returns Formatlanmış başlıq
 */
export const formatCategoryTitle = (category: CategoryWithColumns): string => {
  const remainingDays = category.deadline 
    ? getRemainingDays(new Date(category.deadline))
    : null;

  let deadlineInfo = '';
  if (remainingDays !== null) {
    if (remainingDays < 0) {
      deadlineInfo = ' (Müddət bitib)';
    } else if (remainingDays === 0) {
      deadlineInfo = ' (Bu gün)';
    } else {
      deadlineInfo = ` (${remainingDays} gün qalıb)`;
    }
  }

  return `${category.name}${deadlineInfo}`;
};

/**
 * Kateqoriya tamamlanma statusunu əldə edir
 * 
 * @param categoryData Kateqoriya məlumatları
 * @returns Status və tamamlanma faizi
 */
export const getCategoryCompletionStatus = (categoryData?: CategoryEntryData) => {
  if (!categoryData) return { status: 'draft', completionPercentage: 0 };

  if (categoryData.status === 'approved') {
    return { status: 'approved', completionPercentage: 100 };
  } else if (categoryData.status === 'rejected') {
    return { status: 'rejected', completionPercentage: categoryData.completionPercentage || 0 };
  } else if (categoryData.submittedAt) {
    return { status: 'submitted', completionPercentage: categoryData.completionPercentage || 0 };
  } else if (categoryData.entries.length > 0) {
    // Məlumatların mövcudluğunu yoxla
    const requiredEntryCount = categoryData.entries.filter(entry => {
      // Burada isRequired xassəsinə çatmaq mümkün deyil
      // Buna görə də sadəcə entry mövcudluğunu və statusunu yoxlayırıq
      return true;
    }).length;
    
    if (requiredEntryCount > 0) {
      return { 
        status: 'draft', 
        completionPercentage: categoryData.completionPercentage || 0 
      };
    }
  }

  return { status: 'draft', completionPercentage: 0 };
};

/**
 * Qalan günləri hesablayır
 * 
 * @param targetDate Hədəf tarix
 * @returns Qalan gün sayı
 */
export const getRemainingDays = (targetDate: Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  const differenceInTime = targetDate.getTime() - today.getTime();
  const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
  
  return differenceInDays;
};

/**
 * Son gün vəziyyətini təyin edir
 * 
 * @param deadline Son tarix
 * @returns Vəziyyət kodu: 'overdue', 'today', 'soon' və ya 'normal'
 */
export const getDeadlineStatus = (deadline?: string | Date): string => {
  if (!deadline) return 'normal';
  
  const deadlineDate = new Date(deadline);
  const remainingDays = getRemainingDays(deadlineDate);
  
  if (remainingDays < 0) return 'overdue';
  if (remainingDays === 0) return 'today';
  if (remainingDays <= 3) return 'soon';
  return 'normal';
};

/**
 * Kateqoriyanın tamamlanma faizini hesablayır
 * 
 * @param categoryWithColumns Kateqoriya və sütunları
 * @param formData Form məlumatları
 * @returns Tamamlanma faizi (0-100)
 */
export const calculateCategoryCompletion = (
  categoryWithColumns: CategoryWithColumns,
  formData: DataEntryForm
): number => {
  const categoryData = formData.entries.find(entry => entry.categoryId === categoryWithColumns.id);
  
  if (!categoryData || !categoryData.entries) return 0;
  
  const requiredColumns = categoryWithColumns.columns.filter(col => col.isRequired);
  if (requiredColumns.length === 0) return 100;
  
  let filledRequiredCount = 0;
  
  requiredColumns.forEach(column => {
    const entry = categoryData.entries.find(e => e.columnId === column.id);
    if (entry && entry.value !== undefined && entry.value !== null && entry.value !== '') {
      filledRequiredCount++;
    }
  });
  
  return Math.round((filledRequiredCount / requiredColumns.length) * 100);
};

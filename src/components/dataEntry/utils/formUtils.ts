
import { CategoryEntryData, EntryValue, DataFormValue } from "@/types/dataEntry";
import { CategoryWithColumns } from "@/types/column";

// Məlumatları formdan Supabase formatına çevirmək
export const adaptFormDataToSupabase = (
  schoolId: string, 
  categoryEntries: CategoryEntryData[]
) => {
  const result: any[] = [];
  
  categoryEntries.forEach(category => {
    category.entries.forEach(entry => {
      result.push({
        school_id: schoolId,
        category_id: category.categoryId,
        column_id: entry.columnId,
        value: entry.value ? String(entry.value) : null,
        status: 'pending'
      });
    });
  });
  
  return result;
};

// Verilənlər bazasından gələn məlumatları forma formatına çevirmək
export const adaptSupabaseToFormData = (
  dataEntries: any[], 
  categories: CategoryWithColumns[]
): CategoryEntryData[] => {
  const categoryMap = new Map<string, CategoryEntryData>();
  
  // Hər bir kategori üçün boş entries array yaradaq
  categories.forEach(category => {
    categoryMap.set(category.id, {
      categoryId: category.id,
      entries: []
    });
  });
  
  // Data entries'ləri müvafiq kategoriyalara əlavə edək
  dataEntries.forEach(entry => {
    const categoryId = entry.category_id;
    const categoryData = categoryMap.get(categoryId);
    
    if (categoryData) {
      categoryData.entries.push({
        columnId: entry.column_id,
        value: entry.value
      });
    }
  });
  
  return Array.from(categoryMap.values());
};

// Dəyişiklikləri izləmək üçün helper funksiya
export const hasChanges = (
  original: CategoryEntryData[], 
  current: CategoryEntryData[]
): boolean => {
  if (original.length !== current.length) return true;
  
  for (let i = 0; i < original.length; i++) {
    const origCategory = original[i];
    const currCategory = current.find(c => c.categoryId === origCategory.categoryId);
    
    if (!currCategory) return true;
    if (origCategory.entries.length !== currCategory.entries.length) return true;
    
    for (const origEntry of origCategory.entries) {
      const currEntry = currCategory.entries.find(e => e.columnId === origEntry.columnId);
      if (!currEntry) return true;
      if (origEntry.value !== currEntry.value) return true;
    }
  }
  
  return false;
};

// Tamamlanma faizini hesablamaq üçün helper funksiya
export const calculateCompletionPercentage = (
  categoryEntries: CategoryEntryData[], 
  categories: CategoryWithColumns[]
): { overall: number; byCategory: Record<string, number> } => {
  const result: Record<string, number> = {};
  let totalComplete = 0;
  let totalFields = 0;
  
  categories.forEach(category => {
    const requiredColumns = category.columns.filter(col => col.is_required);
    if (requiredColumns.length === 0) {
      result[category.id] = 100;
      totalComplete += 1;
      totalFields += 1;
      return;
    }
    
    const categoryData = categoryEntries.find(ce => ce.categoryId === category.id);
    if (!categoryData) {
      result[category.id] = 0;
      totalFields += 1;
      return;
    }
    
    let filledCount = 0;
    
    requiredColumns.forEach(column => {
      const entry = categoryData.entries.find(e => e.columnId === column.id);
      if (entry && entry.value !== null && entry.value !== undefined && entry.value !== '') {
        filledCount++;
      }
    });
    
    const completionPercentage = Math.round((filledCount / requiredColumns.length) * 100);
    result[category.id] = completionPercentage;
    
    totalComplete += filledCount;
    totalFields += requiredColumns.length;
  });
  
  const overall = totalFields > 0 
    ? Math.round((totalComplete / totalFields) * 100) 
    : 0;
  
  return { overall, byCategory: result };
};

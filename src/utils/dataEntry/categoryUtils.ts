
import { CategoryWithColumns } from '@/types/column';
import { DataEntryStatus, CategoryEntryData, ColumnEntry } from '@/types/dataEntry';
import { FormItem } from '@/types/form';

// Helper funksiyası - boş sütun giriş məlumatlarını yaratmaq üçün
export const createEmptyEntries = (category: CategoryWithColumns): Record<string, string> => {
  if (!category || !category.columns) return {};
  
  return category.columns.reduce((acc: Record<string, string>, column) => {
    acc[column.id] = column.defaultValue || '';
    return acc;
  }, {});
};

// Helper funksiyası - məlumatları doldurulma % hesablamaq üçün
export const calculateCompletionPercentage = (
  entries: Record<string, string>,
  category: CategoryWithColumns
): number => {
  if (!category || !category.columns || category.columns.length === 0) return 0;
  
  const columns = category.columns;
  const requiredColumns = columns.filter(col => col.isRequired);
  
  if (requiredColumns.length === 0) {
    // Əgər heç bir məcburi sütun yoxdursa, doldurulmuş sütunların faizini hesablayaq
    const filledFields = columns.filter(col => entries[col.id]?.trim() !== '');
    return Math.round((filledFields.length / columns.length) * 100);
  }
  
  // Məcburi sütunlar üzərindən hesablama
  const filledRequiredColumns = requiredColumns.filter(col => entries[col.id]?.trim() !== '');
  return Math.round((filledRequiredColumns.length / requiredColumns.length) * 100);
};

// Helper funksiyası - FormItem yaratmaq üçün
export const createFormItem = (
  category: CategoryWithColumns,
  entries: Record<string, string>,
  status: DataEntryStatus
): FormItem => {
  let completionPercentage = calculateCompletionPercentage(entries, category);
  
  const totalCount = category.columns.length;
  const filledCount = Object.values(entries).filter(value => value?.trim() !== '').length;
  
  return {
    id: category.category.id,
    title: category.category.name,
    status,
    completionPercentage,
    deadline: category.category.deadline || new Date().toISOString(),
    categoryId: category.category.id,
    filledCount,
    totalCount
  };
};

// Helper funksiyası - məlumatları GitHub'dan əldə etmək üçün
export const fetchCategoryDataFromGitHub = async (): Promise<CategoryEntryData[]> => {
  try {
    // Nümunə data
    const sampleData = [
      {
        id: "entry-1", 
        categoryId: "cat-1",
        categoryName: "Ümumi Məlumatlar",
        status: "draft" as DataEntryStatus,
        order: 1,
        progress: 50,
        values: [
          {id: "val-1", columnId: "col-1", value: "Məktəb Adı", status: "draft" as DataEntryStatus},
          {id: "val-2", columnId: "col-2", value: "1000", status: "draft" as DataEntryStatus}
        ],
        isSubmitted: false,
        entries: {}
      },
      {
        id: "entry-2",
        categoryId: "cat-2",
        categoryName: "Təhsil Məlumatları",
        status: "pending" as DataEntryStatus,
        order: 2,
        progress: 75,
        values: [
          {id: "val-3", columnId: "col-3", value: "100", status: "pending" as DataEntryStatus},
          {id: "val-4", columnId: "col-4", value: "120", status: "pending" as DataEntryStatus}
        ],
        isSubmitted: false,
        entries: {}
      }
    ];
    
    return sampleData;
  } catch (error) {
    console.error("Failed to fetch category data:", error);
    return [];
  }
};

// Helper funksiyası - kateqoriya məlumatlarını tipin tələblərinə uyğunlaşdırmaq
export const adaptCategoryEntryData = (categories: CategoryWithColumns[]): CategoryEntryData[] => {
  return categories.map((category) => ({
    id: category.category.id,
    categoryId: category.category.id,
    categoryName: category.category.name,
    order: category.category.order || 0,
    status: "draft" as DataEntryStatus,
    progress: 0,
    values: category.columns.map((column) => ({
      id: column.id,
      columnId: column.id,
      value: column.defaultValue || '',
      status: "draft" as DataEntryStatus,
      isValid: true // ColumnEntry tipinə uyğunlaşdırılmış
    })),
    isSubmitted: false,
    entries: {} // Boş entries əlavə edildi
  }));
};

// Helper funksiyası - kateqoriya məlumatlarını CategoryEntryData formatına çevirmək üçün
export const convertToCategoryEntryData = (
  category: CategoryWithColumns,
  entries: Record<string, string>,
  status: DataEntryStatus = 'draft'
): CategoryEntryData => {
  return {
    id: category.category.id,
    categoryId: category.category.id,
    categoryName: category.category.name,
    order: category.category.order || 0,
    status,
    progress: calculateCompletionPercentage(entries, category),
    values: [],
    isSubmitted: status === 'approved' || status === 'pending',
    entries: entries
  };
};

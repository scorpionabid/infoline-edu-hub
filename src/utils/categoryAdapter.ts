
import { Category, CategoryWithColumns, adaptSupabaseCategory } from '@/types/category';
import { Column } from '@/types/column';
import { columnAdapter } from './columnAdapter';

export const categoryAdapter = {
  adaptCategoryToForm: (category: Category) => {
    return {
      id: category.id,
      name: category.name,
      description: category.description || '',
      status: category.status || 'active',
      deadline: category.deadline || null,
      assignment: category.assignment || 'all',
      priority: category.priority || 0,
    };
  },
  
  adaptFormToCategory: (formData: Partial<Category>): Partial<Category> => {
    return {
      id: formData.id,
      name: formData.name,
      description: formData.description,
      status: formData.status || 'active',
      deadline: formData.deadline,
      assignment: formData.assignment || 'all',
      priority: formData.priority || 0,
    };
  },
  
  adaptSupabaseToCategory: (dbCategory: any): Category => {
    return adaptSupabaseCategory(dbCategory);
  },
  
  adaptToCategoryWithColumns: (
    category: Category, 
    columns: Column[]
  ): CategoryWithColumns => {
    return {
      ...category,
      columns: columns.filter(col => col.category_id === category.id),
      completionPercentage: 0 // Default değer, gerçek hesaplama implementasyonu eklenebilir
    };
  },
  
  adaptSupabaseToCategoryWithColumns: (
    dbCategory: any, 
    dbColumns: any[] = []
  ): CategoryWithColumns => {
    const category = adaptSupabaseCategory(dbCategory);
    
    // DB-dən gələn sütunları modellərə çevir
    const columns = dbColumns
      .filter(col => col.category_id === dbCategory.id)
      .map((col) => {
        // ColumnOption tipinə uyğun konversiya
        let options = null;
        if (col.options) {
          if (Array.isArray(col.options)) {
            options = col.options.map((opt: any) => ({
              id: opt.id || String(Math.random()),
              label: opt.label,
              value: opt.value
            }));
          } else if (typeof col.options === 'object') {
            options = []
          }
        }
        
        return {
          ...col,
          options
        };
      });
    
    return {
      ...category,
      columns,
      completionPercentage: 0 // Default dəyər, real hesablama implementasiyası əlavə edilə bilər
    };
  }
};

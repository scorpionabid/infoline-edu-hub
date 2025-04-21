
import { Category, CategoryWithColumns, CategoryStatus } from '@/types/category';
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
    return {
      id: dbCategory.id,
      name: dbCategory.name,
      description: dbCategory.description || '',
      status: dbCategory.status || 'active',
      deadline: dbCategory.deadline || null,
      assignment: dbCategory.assignment || 'all',
      column_count: dbCategory.column_count || 0,
      archived: dbCategory.archived || false,
      priority: dbCategory.priority || 0,
      created_at: dbCategory.created_at,
      updated_at: dbCategory.updated_at
    };
  },
  
  adaptToCategoryWithColumns: (
    category: Category, 
    columns: Column[]
  ): CategoryWithColumns => {
    return {
      ...category,
      columns: columns.filter(col => col.category_id === category.id),
      columnCount: category.column_count || columns.filter(col => col.category_id === category.id).length
    };
  },
  
  adaptSupabaseToCategoryWithColumns: (
    dbCategory: any, 
    dbColumns: any[] = []
  ): CategoryWithColumns => {
    const category = categoryAdapter.adaptSupabaseToCategory(dbCategory);
    
    // DB-dən gələn sütunları modellərə çevir
    const columns = dbColumns
      .filter(col => col.category_id === dbCategory.id)
      .map(columnAdapter.adaptSupabaseToColumn);
    
    return {
      ...category,
      columns,
      columnCount: category.column_count || columns.length
    };
  }
};

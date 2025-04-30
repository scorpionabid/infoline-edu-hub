
import { Column, ColumnOption, ColumnType, ColumnValidation } from '@/types/column';
import { supabase } from '@/integrations/supabase/client';

// Supabasedən gələn xam sütun məlumatlarını Column tipinə çevirmək
export const adaptColumn = (rawColumn: any): Column => {
  // Options və validation JSON sahələrini parse et
  const options = parseJsonField(rawColumn.options);
  const validation = parseJsonField(rawColumn.validation);

  return {
    id: rawColumn.id,
    category_id: rawColumn.category_id,
    name: rawColumn.name,
    type: rawColumn.type as ColumnType,
    is_required: rawColumn.is_required,
    placeholder: rawColumn.placeholder || '',
    help_text: rawColumn.help_text || '',
    order_index: rawColumn.order_index,
    options: options || [],
    validation: validation || {},
    default_value: rawColumn.default_value || '',
    status: rawColumn.status || 'active',
    created_at: rawColumn.created_at,
    updated_at: rawColumn.updated_at,
    parent_column_id: rawColumn.parent_column_id
  };
};

// JSON sahələrini parse etmək üçün köməkçi funksiya
const parseJsonField = (value: any): any => {
  if (!value) return null;
  
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (e) {
      // Xüsusi format: {"label":"X","value":"x"},{"label":"Y","value":"y"}
      if (value.includes('},{')) {
        try {
          const jsonStr = value.startsWith('[') ? value : `[${value}]`;
          return JSON.parse(jsonStr);
        } catch (err) {
          console.warn('Xüsusi formatı parse etmək alınmadı');
        }
      }
      
      // Vergüllə ayrılmış siyahı
      if (value.includes(',')) {
        return value.split(',')
          .map(item => item.trim())
          .filter(Boolean)
          .map(item => ({ label: item, value: item }));
      }
      
      return value;
    }
  }
  
  return value;
};

// Sütunları kateqoriyalara görə qruplaşdırmaq üçün
export const groupColumnsByCategory = (columns: Column[]): Record<string, Column[]> => {
  return columns.reduce((acc, column) => {
    const categoryId = column.category_id;
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(column);
    return acc;
  }, {} as Record<string, Column[]>);
};

// Sütunları oxumaq üçün Supabase sorğusu
export const fetchColumns = async (categoryId?: string): Promise<Column[]> => {
  try {
    let query = supabase.from('columns').select('*');
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    query = query.order('order_index', { ascending: true });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data || []).map(adaptColumn);
  } catch (error) {
    console.error('Error fetching columns:', error);
    throw error;
  }
};

export const useColumnAdapters = () => {
  return {
    adaptColumn,
    groupColumnsByCategory,
    fetchColumns
  };
};

export default useColumnAdapters;

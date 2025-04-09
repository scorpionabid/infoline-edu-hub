
import { supabase } from '@/integrations/supabase/client';

/**
 * Kateqoriyadakı sütun sayını yeniləyən funksiya
 */
export const updateCategoryColumnCount = async (categoryId: string): Promise<void> => {
  try {
    // Kateqoriyadakı sütun sayını hesablayırıq
    const { count, error: countError } = await supabase
      .from('columns')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId);
    
    if (countError) throw countError;
    
    // Kateqoriyanı yeniləyirik
    const { error: updateError } = await supabase
      .from('categories')
      .update({ column_count: count || 0 })
      .eq('id', categoryId);
    
    if (updateError) throw updateError;
    
  } catch (err) {
    console.error('Error updating category column count:', err);
  }
};

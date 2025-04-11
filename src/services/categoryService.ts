
import { supabase } from '@/integrations/supabase/client';

// Kateqoriyalar üzrə tamamlanma məlumatlarını əldə etmək
export const getCategoryCompletionData = async (): Promise<Array<{ name: string; completed: number }>> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        data_entries:data_entries(status)
      `);

    if (error) {
      console.error("Kateqoriya məlumatları əldə edilərkən xəta:", error);
      throw error;
    }

    return data.map(category => {
      const entries = category.data_entries || [];
      const total = entries.length;
      const completed = entries.filter((entry: any) => entry.status === 'approved').length;
      const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        name: category.name,
        completed: completionPercentage
      };
    });
  } catch (error: any) {
    console.error("Kateqoriya tamamlanma məlumatları əldə edilərkən xəta:", error);
    return [];
  }
};

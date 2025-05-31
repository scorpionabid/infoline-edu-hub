import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Category } from '@/types/category';

interface UseSectorCategoriesProps {
  isSectorAdmin: boolean;
}

export const useSectorCategories = ({ isSectorAdmin }: UseSectorCategoriesProps) => {
  const { t } = useLanguage();
  const [sectorCategories, setSectorCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchSectorCategories = async () => {
      if (isSectorAdmin) {
        setIsLoading(true);
        setError(null);
        
        try {
          const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('assignment', 'sectors')
            .eq('status', 'active')
            .order('priority', { ascending: true });
            
          if (error) throw error;
          
          const safeData = Array.isArray(data) ? data : [];
          
          // Safety check for empty data
          if (safeData.length === 0) {
            setSectorCategories([]);
            setIsLoading(false);
            return;
          }
          
          // Get valid category IDs
          const validCategoryIds = safeData
            .filter(cat => cat && cat.id)
            .map(cat => cat.id);
          
          // Safety check for no valid IDs
          if (validCategoryIds.length === 0) {
            setSectorCategories([]);
            setIsLoading(false);
            return;
          }
            
          // Kateqoriyalar üçün sütunları yükləyirik
          const { data: columnsData, error: columnsError } = await supabase
            .from('columns')
            .select('*')
            .in('category_id', validCategoryIds)
            .eq('status', 'active')
            .order('order_index', { ascending: true });
            
          if (columnsError) throw columnsError;
          
          const safeColumnsData = Array.isArray(columnsData) ? columnsData : [];
          
          // Kateqoriyaları və sütunları birləşdiririk
          const categoriesWithColumns = safeData.map(category => {
            if (!category) return null;
            
            return {
              ...category,
              columns: safeColumnsData.filter(col => col && col.category_id === category.id) || []
            };
          }).filter(Boolean) as Category[];
          
          setSectorCategories(categoriesWithColumns);
        } catch (error: any) {
          console.error('Sektor kateqoriyalarını yükləyərkən xəta:', error);
          setError(error.message || t('errorLoadingSectorCategories'));
          toast.error(t('errorLoadingSectorCategories'));
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchSectorCategories();
  }, [isSectorAdmin, t]);
  
  return {
    sectorCategories,
    isLoading,
    error
  };
};

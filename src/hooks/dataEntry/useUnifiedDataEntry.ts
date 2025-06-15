
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/category';
import { Column } from '@/types/column';

interface UseUnifiedDataEntryProps {
  entityId: string;
  entityType: 'school' | 'sector' | 'region';
}

export const useUnifiedDataEntry = ({ entityId, entityType }: UseUnifiedDataEntryProps) => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['unified-data-entry', entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          columns!inner(*)
        `)
        .eq('status', 'active')
        .order('order_index');

      if (error) throw error;
      return data;
    },
    enabled: !!entityId
  });

  useEffect(() => {
    if (categoriesData) {
      const transformedCategories = categoriesData.map(cat => ({
        ...cat,
        assignment: cat.assignment as 'all' | 'schools' | 'sectors' | 'regions',
        status: cat.status as 'active' | 'inactive' | 'draft' | 'approved' | 'archived' | 'pending',
        columns: cat.columns || []
      }));
      setCategories(transformedCategories);
    }
  }, [categoriesData]);

  return {
    categories,
    loading: isLoading,
    refetch: () => {
      // Refetch logic if needed
    }
  };
};

export default useUnifiedDataEntry;

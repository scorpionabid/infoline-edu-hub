
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UseSectorsQueryResult {
  sectors: any[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useSectorsQuery = (): UseSectorsQueryResult => {
  const {
    data: sectors = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['sectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    }
  });

  return {
    sectors,
    loading,
    error: error?.message || null,
    refetch
  };
};

export default useSectorsQuery;

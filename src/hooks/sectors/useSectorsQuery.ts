
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UseSectorsQueryResult {
  sectors: any[];
  loading: boolean;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
}

export const useSectorsQuery = (): UseSectorsQueryResult => {
  const {
    data: sectors = [],
    isLoading,
    isError,
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
    loading: isLoading,
    isLoading,
    isError,
    error: error?.message || null,
    refetch
  };
};

export default useSectorsQuery;

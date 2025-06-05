
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UseSchoolsQueryResult {
  schools: any[];
  loading: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useSchoolsQuery = (): UseSchoolsQueryResult => {
  const {
    data: schools = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    }
  });

  return {
    schools,
    loading: isLoading,
    isLoading,
    isError,
    error,
    refetch
  };
};

export default useSchoolsQuery;


import { useState, useEffect, useCallback } from 'react';
import { Region } from '@/types/region';
import { fetchRegions } from '@/services/regionService';
import { toast } from 'sonner';

export function useRegions() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isOperationComplete, setIsOperationComplete] = useState(false);

  const getRegions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // fetchRegions çağırırıq və nəticəni alırıq
      const regionsData = await fetchRegions();
      
      // Əmin olaq ki, created_at sahəsi mövcuddur
      const validRegions = regionsData.map(region => ({
        ...region,
        created_at: region.created_at || new Date().toISOString()
      }));
      
      // State-i yeniləyirik
      setRegions(validRegions);
    } catch (err: any) {
      console.error('Regionları yükləmə xətası:', err);
      setError(err);
      toast.error('Xəta baş verdi', {
        description: 'Regionları yükləmək mümkün olmadı'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getRegions();
  }, [getRegions]);

  useEffect(() => {
    if (isOperationComplete) {
      getRegions();
      setIsOperationComplete(false);
    }
  }, [isOperationComplete, getRegions]);

  return {
    regions,
    loading,
    error,
    refreshRegions: getRegions,
    isOperationComplete,
    setIsOperationComplete
  };
}


import { useState, useEffect } from 'react';
import { Region } from '@/types/school';

export const useRegions = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRegions = async () => {
    setLoading(true);
    try {
      // Mock regions data
      const mockRegions: Region[] = [
        {
          id: 'region-1',
          name: 'Bakı',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'region-2',
          name: 'Gəncə',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 300));
      setRegions(mockRegions);
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  return { 
    regions, 
    loading, 
    error,
    fetchRegions
  };
};

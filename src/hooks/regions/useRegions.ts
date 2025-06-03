
import { useState, useEffect } from 'react';
import { Region } from '@/types/school';

export const useRegions = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Mock regions data
    const mockRegions: Region[] = [
      {
        id: 'region-1',
        name: 'Bakı',
        status: 'active'
      },
      {
        id: 'region-2',
        name: 'Gəncə',
        status: 'active'
      }
    ];

    setTimeout(() => {
      setRegions(mockRegions);
      setLoading(false);
    }, 300);
  }, []);

  return { regions, loading };
};

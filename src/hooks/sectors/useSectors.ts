
import { useState, useEffect } from 'react';
import { Sector } from '@/types/school';

export const useSectors = (regionId?: string) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSectors = async () => {
    setLoading(true);
    try {
      // Mock sectors data
      const mockSectors: Sector[] = [
        {
          id: 'sector-1',
          name: 'Mərkəz Sektoru',
          region_id: regionId || 'region-1',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'sector-2',
          name: 'Şimal Sektoru', 
          region_id: regionId || 'region-1',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 300));
      const filteredSectors = regionId 
        ? mockSectors.filter(sector => sector.region_id === regionId)
        : mockSectors;
      setSectors(filteredSectors);
      return true;
    } catch (err) {
      setError(err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
  }, [regionId]);

  return { 
    sectors, 
    loading, 
    error,
    fetchSectors
  };
};

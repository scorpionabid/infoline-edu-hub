
import { useState, useEffect } from 'react';
import { Sector } from '@/types/school';

export const useSectors = (regionId?: string) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Mock sectors data
    const mockSectors: Sector[] = [
      {
        id: 'sector-1',
        name: 'Mərkəz Sektoru',
        region_id: regionId || 'region-1',
        status: 'active'
      },
      {
        id: 'sector-2',
        name: 'Şimal Sektoru', 
        region_id: regionId || 'region-1',
        status: 'active'
      }
    ];

    setTimeout(() => {
      const filteredSectors = regionId 
        ? mockSectors.filter(sector => sector.region_id === regionId)
        : mockSectors;
      setSectors(filteredSectors);
      setLoading(false);
    }, 300);
  }, [regionId]);

  return { sectors, loading };
};


import { useState, useEffect } from 'react';
import { School } from '@/types/school';

// Mock hook for schools - replace with actual Supabase integration when available
export const useSchools = (sectorId?: string) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Mock data based on sector filter
    const mockSchools: School[] = [
      {
        id: '1',
        name: 'Məktəb 1',
        region_id: 'region-1',
        sector_id: sectorId || 'sector-1',
        status: 'active'
      },
      {
        id: '2', 
        name: 'Məktəb 2',
        region_id: 'region-1',
        sector_id: sectorId || 'sector-1',
        status: 'active'
      }
    ];

    setTimeout(() => {
      const filteredSchools = sectorId 
        ? mockSchools.filter(school => school.sector_id === sectorId)
        : mockSchools;
      setSchools(filteredSchools);
      setLoading(false);
    }, 500);
  }, [sectorId]);

  return { schools, loading };
};

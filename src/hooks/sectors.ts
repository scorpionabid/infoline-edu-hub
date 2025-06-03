
import { useState, useEffect } from 'react';

export const useSectors = (regionId?: string) => {
  const [sectors, setSectors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock sectors data
    const mockSectors = [
      { id: '1', name: 'Sektor 1', region_id: '1', status: 'active' },
      { id: '2', name: 'Sektor 2', region_id: '1', status: 'active' },
      { id: '3', name: 'Sektor 3', region_id: '2', status: 'active' }
    ];
    
    setTimeout(() => {
      setSectors(mockSectors);
      setIsLoading(false);
    }, 300);
  }, [regionId]);

  return { sectors, isLoading };
};

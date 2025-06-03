
import { useState, useEffect } from 'react';

export const useSchools = (sectorId?: string) => {
  const [schools, setSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock schools data
    const mockSchools = [
      { id: '1', name: 'Məktəb 1', sector_id: '1', region_id: '1', status: 'active' },
      { id: '2', name: 'Məktəb 2', sector_id: '1', region_id: '1', status: 'active' },
      { id: '3', name: 'Məktəb 3', sector_id: '2', region_id: '1', status: 'active' }
    ];
    
    setTimeout(() => {
      setSchools(mockSchools);
      setIsLoading(false);
    }, 300);
  }, [sectorId]);

  return { schools, isLoading };
};

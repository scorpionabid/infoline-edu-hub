
import { useState, useEffect } from 'react';

export const useSectorCategories = ({ isSectorAdmin }: { isSectorAdmin: boolean }) => {
  const [sectorCategories, setSectorCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSectorAdmin) {
      setIsLoading(false);
      return;
    }

    // Mock sector category data
    const mockSectorCategories = [
      { id: '1', name: 'Sektor Ümumi Hesabatları', status: 'active' },
      { id: '2', name: 'Sektor İstatistikaları', status: 'active' }
    ];
    
    setTimeout(() => {
      setSectorCategories(mockSectorCategories);
      setIsLoading(false);
    }, 500);
  }, [isSectorAdmin]);

  return { sectorCategories, isLoading };
};


import { useState, useEffect } from 'react';

export const useRegions = () => {
  const [regions, setRegions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock regions data
    const mockRegions = [
      { id: '1', name: 'Bakı', status: 'active' },
      { id: '2', name: 'Gəncə', status: 'active' },
      { id: '3', name: 'Sumqayıt', status: 'active' }
    ];
    
    setTimeout(() => {
      setRegions(mockRegions);
      setIsLoading(false);
    }, 300);
  }, []);

  return { regions, isLoading };
};

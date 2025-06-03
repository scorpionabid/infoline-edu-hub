
import { useState, useEffect } from 'react';

export const useCategoryData = ({ schoolId }: { schoolId?: string }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock category data
    const mockCategories = [
      { id: '1', name: 'Ümumi Məlumatlar', status: 'active' },
      { id: '2', name: 'Tələbə Məlumatları', status: 'active' },
      { id: '3', name: 'Müəllim Məlumatları', status: 'active' }
    ];
    
    setTimeout(() => {
      setCategories(mockCategories);
      setIsLoading(false);
    }, 500);
  }, [schoolId]);

  return { categories, isLoading };
};

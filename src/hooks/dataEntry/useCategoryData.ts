
import { useState, useEffect } from 'react';

interface CategoryData {
  id: string;
  name: string;
  status: string;
  columns?: any[];
}

export const useCategoryData = ({ schoolId, categoryId }: { schoolId?: string; categoryId?: string }) => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock category data
    const mockCategories = [
      { 
        id: '1', 
        name: 'Ümumi Məlumatlar', 
        status: 'active',
        columns: [
          { id: 'col1', name: 'Məktəb adı', type: 'text' },
          { id: 'col2', name: 'Tələbə sayı', type: 'number' }
        ]
      },
      { 
        id: '2', 
        name: 'Tələbə Məlumatları', 
        status: 'active',
        columns: [
          { id: 'col3', name: 'Tələbə adı', type: 'text' },
          { id: 'col4', name: 'Sinif', type: 'select' }
        ]
      },
      { 
        id: '3', 
        name: 'Müəllim Məlumatları', 
        status: 'active',
        columns: [
          { id: 'col5', name: 'Müəllim adı', type: 'text' },
          { id: 'col6', name: 'Fənn', type: 'text' }
        ]
      }
    ];
    
    setTimeout(() => {
      setCategories(mockCategories);
      
      // Set specific category if categoryId is provided
      if (categoryId) {
        const foundCategory = mockCategories.find(cat => cat.id === categoryId);
        setCategory(foundCategory || null);
      }
      
      setIsLoading(false);
    }, 500);
  }, [schoolId, categoryId]);

  return { 
    categories, 
    category, 
    isLoading, 
    error 
  };
};

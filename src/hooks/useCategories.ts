
import { useState, useEffect } from 'react';
import { Category } from '@/types/category';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Burada real Supabase sorğusu olacaq
      // const { data, error } = await supabase.from('categories').select('*');
      
      // Fake API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Fake data
      const mockCategories: Category[] = [
        {
          id: '1',
          name: 'Təhsil statistikası',
          description: 'Ümumi təhsil statistikası',
          assignment: 'all',
          status: 'active',
          deadline: '2023-10-15',
          priority: 1,
          columnCount: 8,
          createdAt: '2023-06-10T12:00:00Z',
          updatedAt: '2023-06-10T12:00:00Z'
        },
        {
          id: '2',
          name: 'Şagird məlumatları',
          description: 'Şagirdlər haqqında məlumatlar',
          assignment: 'sectors',
          status: 'active',
          deadline: '2023-09-20',
          priority: 2,
          columnCount: 12,
          createdAt: '2023-06-12T14:30:00Z',
          updatedAt: '2023-06-12T14:30:00Z'
        },
        {
          id: '3',
          name: 'Müəllim məlumatları',
          description: 'Müəllim heyəti haqqında məlumatlar',
          assignment: 'all',
          status: 'inactive',
          deadline: '2023-08-30',
          priority: 3,
          columnCount: 10,
          createdAt: '2023-06-15T10:45:00Z',
          updatedAt: '2023-06-15T10:45:00Z'
        },
        {
          id: '4',
          name: 'İnfrastruktur',
          description: 'Məktəb binası və təchizat',
          assignment: 'all',
          status: 'draft',
          priority: 4,
          columnCount: 6,
          createdAt: '2023-07-01T09:15:00Z',
          updatedAt: '2023-07-01T09:15:00Z'
        },
        {
          id: '5',
          name: 'Tədris proqramı',
          description: 'Tədris proqramı və fənlər haqqında məlumatlar',
          assignment: 'sectors',
          status: 'active',
          deadline: '2023-11-05',
          priority: 0,
          columnCount: 7,
          createdAt: '2023-07-05T11:20:00Z',
          updatedAt: '2023-07-05T11:20:00Z'
        }
      ];
      
      setCategories(mockCategories);
    } catch (err: any) {
      console.error('Categories fetch error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCategories();
  }, []);
  
  const refetch = async () => {
    await fetchCategories();
  };
  
  return { categories, loading, error, refetch };
}

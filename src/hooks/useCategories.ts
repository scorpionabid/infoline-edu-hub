
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category, CategoryFilter, adaptSupabaseCategory } from '@/types/category';

export const useCategories = (filter?: CategoryFilter) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase.from('categories').select('*');
      
      // Apply filters if provided
      if (filter) {
        if (filter.status) {
          query = query.eq('status', filter.status);
        }
        
        if (filter.assignment) {
          query = query.eq('assignment', filter.assignment);
        }
        
        if (filter.search) {
          query = query.or(`name.ilike.%${filter.search}%,description.ilike.%${filter.search}%`);
        }
        
        // By default don't show archived categories unless explicitly requested
        if (!filter.showArchived) {
          query = query.eq('archived', false);
        }
      } else {
        // Default behavior: don't show archived categories
        query = query.eq('archived', false);
      }
      
      query = query.order('priority', { ascending: true }).order('name');
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Mock data if no data returned
      if (!data || data.length === 0) {
        const mockCategories = [
          {
            id: '1',
            name: 'Ümumi məlumat',
            description: 'Məktəbin ümumi məlumatları',
            status: 'active',
            priority: 1,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            assignment: 'all',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            column_count: 5,
            archived: false
          },
          {
            id: '2',
            name: 'Müəllim heyəti',
            description: 'Müəllim heyəti haqqında məlumatlar',
            status: 'active',
            priority: 2,
            deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            assignment: 'all',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            column_count: 8,
            archived: false
          },
          {
            id: '3',
            name: 'Şagirdlər',
            description: 'Şagirdlər haqqında məlumatlar',
            status: 'active',
            priority: 3,
            deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            assignment: 'all',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            column_count: 6,
            archived: false
          }
        ];
        
        // Convert mock data to proper Category objects
        setCategories(mockCategories.map(cat => adaptSupabaseCategory(cat)));
      } else {
        // Convert Supabase data to proper Category objects
        setCategories(data.map(cat => adaptSupabaseCategory(cat)));
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);
  
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  return { categories, loading, error, refetch: fetchCategories };
};

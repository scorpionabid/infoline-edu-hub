import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/category';
import { useDebounce } from '../common/useDebounce';
import { normalizeCategoryStatus } from '@/types/category';

interface UseCategoriesEnhancedOptions {
  initialCategories?: Category[];
  searchTerm?: string;
  statusFilter?: string | string[];
  enabled?: boolean;
}

interface UseCategoriesEnhancedResult {
  categories: Category[];
  loading: boolean;
  error: Error | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string | string[];
  setStatusFilter: (status: string | string[]) => void;
  refetch: () => Promise<void>;
}

export const useCategoriesEnhanced = ({
  initialCategories = [],
  searchTerm: initialSearchTerm = '',
  statusFilter: initialStatusFilter = 'active',
  enabled = true,
}: UseCategoriesEnhancedOptions): UseCategoriesEnhancedResult => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState<boolean>(!initialCategories && enabled);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
  const [statusFilter, setStatusFilter] = useState<string | string[]>(initialStatusFilter);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategories(initialCategories);
    }
  }, [initialCategories]);

  const fetchCategories = async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('categories')
        .select('*')
        .order('priority', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      fetchCategories();
    }
  }, [enabled]);

  // Filter categories based on search and status
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    
    return categories.filter(category => {
      // Text search filter
      const matchesSearch = !searchTerm || 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
      // Status filter
      const statusArray = normalizeCategoryStatus(statusFilter);
      const matchesStatus = statusArray.includes(category.status as any);
    
      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  const memoizedValue = useMemo(() => ({
    categories: filteredCategories,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    refetch: fetchCategories,
  }), [filteredCategories, loading, error, searchTerm, statusFilter, fetchCategories]);

  return memoizedValue;
};

export default useCategoriesEnhanced;

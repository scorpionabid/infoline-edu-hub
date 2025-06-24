import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors';
  completion_rate?: number;
}

interface Column {
  id: string;
  name: string;
  type: string;
  is_required: boolean;
  help_text?: string;
  placeholder?: string;
  options?: any[];
}

export const useSectorCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingColumns, setIsLoadingColumns] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const user = useAuthStore(selectUser);

  // Load categories
  const loadCategories = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingCategories(true);
    setError(null);
    
    try {
      console.log('[useSectorCategories] Loading categories for user role:', user.role);
      
      // Query categories based on user role and assignment
      let query = supabase
        .from('categories')
        .select('id, name, description, assignment, status')
        .eq('status', 'active')
        .order('name');

      // Sektoradmin həm 'all' həm də 'sectors' kateqoriyalarını görə bilər
      if (user.role === 'sectoradmin') {
        query = query.in('assignment', ['all', 'sectors']);
      } else {
        // Digər rollar üçün assignment filter
        query = query.eq('assignment', 'all');
      }

      const { data, error } = await query;

      if (error) {
        console.error('[useSectorCategories] Categories query error:', error);
        throw error;
      }

      console.log('[useSectorCategories] Categories loaded:', data?.length);
      setCategories(data || []);
      
    } catch (err: any) {
      console.error('[useSectorCategories] Load categories error:', err);
      setError(err.message || 'Kateqoriyalar yüklənərkən xəta');
      toast.error('Kateqoriyalar yüklənərkən xəta');
    } finally {
      setIsLoadingCategories(false);
    }
  }, [user]);

  // Load columns for a category
  const loadColumns = useCallback(async (categoryId: string) => {
    if (!categoryId) return;
    
    setIsLoadingColumns(true);
    setError(null);
    
    try {
      console.log('[useSectorCategories] Loading columns for category:', categoryId);
      
      const { data, error } = await supabase
        .from('columns')
        .select('id, name, type, is_required, help_text, placeholder, options, status')
        .eq('category_id', categoryId)
        .eq('status', 'active')
        .order('order_index');

      if (error) {
        console.error('[useSectorCategories] Columns query error:', error);
        throw error;
      }

      console.log('[useSectorCategories] Columns loaded:', data?.length);
      setColumns(data || []);
      
    } catch (err: any) {
      console.error('[useSectorCategories] Load columns error:', err);
      setError(err.message || 'Sütunlar yüklənərkən xəta');
      toast.error('Sütunlar yüklənərkən xəta');
    } finally {
      setIsLoadingColumns(false);
    }
  }, []);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    columns,
    isLoadingCategories,
    isLoadingColumns,
    error,
    loadCategories,
    loadColumns,
  };
};
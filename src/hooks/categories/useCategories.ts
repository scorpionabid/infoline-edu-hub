
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/category';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { isSuperAdmin, isRegionAdmin, isSectorAdmin, canViewSectorCategories } = usePermissions();
  const { t } = useLanguage();

  // Kategoriyaları yükləmək üçün funksiya
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase.from('categories').select('*');

      // Kategoriya gizliliyi yoxlaması:
      // Sektor admini və ya Okul admini yalnız "all" təyinatı olan və ya "sectors" təyinatı olan kategoriyaları görə bilər
      if (!isSuperAdmin && !isRegionAdmin && canViewSectorCategories) {
        query = query.in('assignment', ['all', 'sectors']);
      }

      // Status filteri - yalnız aktiv olanları göstər
      query = query.eq('status', 'active').eq('archived', false);

      const { data, error: fetchError } = await query.order('priority', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        setCategories(data as Category[]);
        setFilteredCategories(data as Category[]);
      }
    } catch (err: any) {
      console.error('Kategoriyaları yükləyərkən xəta baş verdi:', err);
      setError(err.message || t('genericError'));
      toast.error(t('errorFetchingCategories'), {
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [isSuperAdmin, isRegionAdmin, isSectorAdmin, canViewSectorCategories, t]);

  // Component mount olduğunda kategoriyaları yüklə
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Axtarış sorğusu dəyişdikdə kategoriyaları filtrə
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredCategories(filtered);
    }
  }, [searchQuery, categories]);

  return {
    categories,
    filteredCategories,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    refetch: fetchCategories,
    getCategories: fetchCategories
  };
};

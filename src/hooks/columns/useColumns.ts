
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/column';
import { useColumnMutations } from './useColumnMutations';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { columnAdapter } from '@/utils/columnAdapter';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

// Sütunları əldə etmək üçün sorğu funksiyası
const fetchColumns = async (categoryId?: string): Promise<Column[]> => {
  let query = supabase.from('columns').select('*');

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Sütunları yükləmə xətası:', error);
    throw new Error(`Sütunları yükləmə xətası: ${error.message}`);
  }

  // Sütunları tip-təhlükəsiz formata çevir
  return data.map(columnAdapter.adaptSupabaseToColumn);
};

export const useColumns = (categoryId?: string) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { createColumn, updateColumn, deleteColumn, loading: mutationLoading } = useColumnMutations();
  const { userRole, canRegionAdminManageCategoriesColumns } = usePermissions();
  
  // Filter vəziyyətləri
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // React Query ilə sütunları əldə et
  const {
    data: columns = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['columns', categoryId],
    queryFn: () => fetchColumns(categoryId),
    staleTime: 1000 * 60 * 5, // 5 dəqiqə
  });

  // Sütun yaratma funksiyası
  const saveColumn = useCallback(async (columnData: Partial<Column>) => {
    try {
      // İcazə yoxlaması
      if (
        userRole !== 'superadmin' && 
        (!canRegionAdminManageCategoriesColumns || userRole !== 'regionadmin')
      ) {
        toast.error(t('noPermission'));
        return { success: false, error: 'No permission' };
      }

      let result;
      
      if (columnData.id) {
        // Sütun mövcuddursa yenilə
        result = await updateColumn(columnData);
      } else {
        // Yeni sütun yarat
        result = await createColumn(columnData);
      }

      if (result.success) {
        // Sorğuları yenilə
        await queryClient.invalidateQueries({ queryKey: ['columns'] });
        await queryClient.invalidateQueries({ queryKey: ['categories'] });
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error('Sütun əməliyyatı xətası:', error);
      toast.error(t('columnOperationFailed'));
      return { success: false, error: error.message };
    }
  }, [userRole, canRegionAdminManageCategoriesColumns, updateColumn, createColumn, queryClient, t]);

  // Sütunu silmə funksiyası
  const handleDeleteColumn = useCallback(async (columnId: string, categoryId: string) => {
    try {
      // İcazə yoxlaması
      if (
        userRole !== 'superadmin' && 
        (!canRegionAdminManageCategoriesColumns || userRole !== 'regionadmin')
      ) {
        toast.error(t('noPermission'));
        return false;
      }

      const result = await deleteColumn(columnId, categoryId);
      
      if (result.success) {
        // Sorğuları yenilə
        await queryClient.invalidateQueries({ queryKey: ['columns'] });
        await queryClient.invalidateQueries({ queryKey: ['categories'] });
        return true;
      } else {
        return false;
      }
    } catch (error: any) {
      console.error('Sütun silmə xətası:', error);
      toast.error(t('columnDeleteFailed'));
      return false;
    }
  }, [userRole, canRegionAdminManageCategoriesColumns, deleteColumn, queryClient, t]);

  // Filtrelənmiş sütunları əldə et
  const filteredColumns = columns.filter(column => {
    const nameMatch = searchQuery 
      ? column.name.toLowerCase().includes(searchQuery.toLowerCase()) 
      : true;
    
    const categoryMatch = categoryFilter === 'all' || column.category_id === categoryFilter;
    const typeMatch = typeFilter === 'all' || column.type === typeFilter;
    const statusMatch = statusFilter === 'all' || column.status === statusFilter;
    
    return nameMatch && categoryMatch && typeMatch && statusMatch;
  });

  return {
    columns,
    filteredColumns,
    isLoading: isLoading || mutationLoading,
    isError,
    error,
    refetch,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    saveColumn,
    deleteColumn: handleDeleteColumn
  };
};

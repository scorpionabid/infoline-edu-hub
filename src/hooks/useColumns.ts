
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Column, adaptSupabaseColumn, adaptColumnToSupabase } from '@/types/column';

const fetchColumnsFromSupabase = async (categoryId?: string) => {
  let query = supabase
    .from('columns')
    .select('*')
    .order('order_index');
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) throw error;
  
  return (data || []).map(column => adaptSupabaseColumn(column));
};

export const useColumns = (categoryId?: string) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch columns
  const {
    data: columns = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['columns', categoryId],
    queryFn: () => fetchColumnsFromSupabase(categoryId),
  });

  // Filter columns
  const filteredColumns = columns.filter(column => {
    // Search filter
    if (searchQuery && !column.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (categoryFilter && column.category_id !== categoryFilter) {
      return false;
    }
    
    // Type filter
    if (typeFilter && typeFilter !== 'all' && column.type !== typeFilter) {
      return false;
    }
    
    // Status filter
    if (statusFilter && statusFilter !== 'all' && column.status !== statusFilter) {
      return false;
    }
    
    return true;
  });

  // Add column mutation
  const addColumnMutation = useMutation({
    mutationFn: async (column: Omit<Column, "id">) => {
      const supabaseColumn = adaptColumnToSupabase(column as Partial<Column>);
      
      // JSON tipləri üçün uyğunlaşma
      const sanitizedData = {
        ...supabaseColumn,
        options: supabaseColumn.options ? JSON.parse(JSON.stringify(supabaseColumn.options)) : null,
        validation: supabaseColumn.validation ? JSON.parse(JSON.stringify(supabaseColumn.validation)) : null
      };
      
      const { data, error } = await supabase
        .from('columns')
        .insert([sanitizedData])
        .select()
        .single();

      if (error) throw error;
      
      return adaptSupabaseColumn(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success(t('columnAdded'), {
        description: t('columnAddedSuccessfully')
      });
    },
    onError: (error) => {
      console.error('Error adding column:', error);
      toast.error(t('errorOccurred'), {
        description: t('couldNotAddColumn')
      });
    }
  });

  // Update column mutation
  const updateColumnMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Column> }) => {
      const supabaseUpdates = adaptColumnToSupabase(updates);
      
      // JSON tipləri üçün uyğunlaşma
      const sanitizedUpdates = {
        ...supabaseUpdates,
        options: supabaseUpdates.options ? JSON.parse(JSON.stringify(supabaseUpdates.options)) : null,
        validation: supabaseUpdates.validation ? JSON.parse(JSON.stringify(supabaseUpdates.validation)) : null
      };
      
      const { data, error } = await supabase
        .from('columns')
        .update(sanitizedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return adaptSupabaseColumn(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success(t('columnUpdated'), {
        description: t('columnUpdatedSuccessfully')
      });
    },
    onError: (error) => {
      console.error('Error updating column:', error);
      toast.error(t('errorOccurred'), {
        description: t('couldNotUpdateColumn')
      });
    }
  });

  // Delete column mutation
  const deleteColumnMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success(t('columnDeleted'), {
        description: t('columnDeletedSuccessfully')
      });
    },
    onError: (error) => {
      console.error('Error deleting column:', error);
      toast.error(t('errorOccurred'), {
        description: t('couldNotDeleteColumn')
      });
    }
  });

  // Helper function to update category column count
  const updateCategoryColumnCount = async (categoryId: string) => {
    try {
      // Kateqoriyadakı sütun sayını hesablayırıq
      const { count, error: countError } = await supabase
        .from('columns')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId);
      
      if (countError) throw countError;
      
      // Kateqoriyanı yeniləyirik
      const { error: updateError } = await supabase
        .from('categories')
        .update({ column_count: count || 0 })
        .eq('id', categoryId);
      
      if (updateError) throw updateError;
      
    } catch (err) {
      console.error('Error updating category column count:', err);
    }
  };

  // API-i sadələşdirmək üçün funksiyalar
  const addColumn = async (column: Omit<Column, "id">) => {
    const result = await addColumnMutation.mutateAsync(column);
    
    // Kateqoriyadakı sütun sayını yeniləyirik
    if (column.category_id) {
      await updateCategoryColumnCount(column.category_id);
    }
    
    return result;
  };

  const updateColumn = async (id: string, updates: Partial<Column>) => {
    return updateColumnMutation.mutateAsync({ id, updates });
  };

  const deleteColumn = async (id: string) => {
    // Əvvəlcə silinən sütunun kategoriya ID-sini alaq
    const column = columns.find(c => c.id === id);
    const categoryId = column?.category_id;
    
    await deleteColumnMutation.mutateAsync(id);
    
    // Kateqoriyadakı sütun sayını yeniləyirik
    if (categoryId) {
      await updateCategoryColumnCount(categoryId);
    }
  };

  return {
    columns,
    filteredColumns,
    isLoading,
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
    addColumn,
    updateColumn,
    deleteColumn
  };
};

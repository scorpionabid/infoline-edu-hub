
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth';

// Sütun üçün tip təyini 
export interface Column {
  id: string;
  name: string;
  type: string;
  category_id: string;
  is_required: boolean;
  placeholder?: string;
  help_text?: string;
  status: 'active' | 'inactive';
  order_index?: number;
  validation?: any;
  options?: any;
  default_value?: string;
  created_at: string;
  updated_at: string;
}

export const useColumns = () => {
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Bütün sütunları əldə et - RLS ilə filtrələnəcək
  const fetchColumns = async () => {
    try {
      let query = supabase
        .from('columns')
        .select('*')
        .order('created_at');
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data as Column[];
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Bir sütunu əldə et
  const fetchColumn = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data as Column;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Sütunu yaradır - SuperAdmin üçün
  const createColumn = async (column: Omit<Column, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('columns')
        .insert([column])
        .select();
      
      if (error) throw error;
      
      return data[0] as Column;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Sütunu yenilə - SuperAdmin üçün
  const updateColumn = async ({ id, ...column }: Partial<Column> & { id: string }) => {
    try {
      const { data, error } = await supabase
        .from('columns')
        .update(column)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      return data[0] as Column;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Sütunu sil - SuperAdmin üçün
  const removeColumn = async (id: string) => {
    try {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // React Query Hook'ları
  const {
    data: columns,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['columns'],
    queryFn: fetchColumns,
  });

  const deleteColumn = useMutation({
    mutationFn: removeColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
    },
  });

  return {
    columns,
    isLoading,
    isError,
    error,
    fetchColumn,
    createColumn,
    updateColumn,
    deleteColumn,
    refetch,
    setError,
  };
};


import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Column } from '@/types/column';

export interface ColumnFormData {
  name: string;
  description?: string;
  type: string;
  is_required?: boolean;
  default_value?: string;
  options?: any;
  validation?: any;
  placeholder?: string;
  help_text?: string;
  order_index?: number;
}

export interface UseColumnsQueryResult {
  createColumn: (categoryId: string, columnData: ColumnFormData) => Promise<Column>;
  updateColumn: (columnId: string, columnData: Partial<ColumnFormData>) => Promise<Column>;
  deleteColumn: (columnId: string) => Promise<void>;
  fetchColumnsByCategory: (categoryId: string) => Promise<Column[]>;
  // Deprecated compatibility functions
  add: (data: any) => Promise<any>;
  update: (id: string, data: any) => Promise<any>;
  remove: (id: string) => Promise<any>;
  columns: Column[];
}

export const useColumnsQuery = (): UseColumnsQueryResult => {
  const queryClient = useQueryClient();

  const { data: columns = [] } = useQuery({
    queryKey: ['columns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      return data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async ({ categoryId, columnData }: { categoryId: string; columnData: ColumnFormData }) => {
      const { data, error } = await supabase
        .from('columns')
        .insert([{ ...columnData, category_id: categoryId }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Column created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create column: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ columnId, columnData }: { columnId: string; columnData: Partial<ColumnFormData> }) => {
      const { data, error } = await supabase
        .from('columns')
        .update(columnData)
        .eq('id', columnId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Column updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update column: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (columnId: string) => {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', columnId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success('Column deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete column: ${error.message}`);
    }
  });

  const fetchColumnsByCategory = async (categoryId: string): Promise<Column[]> => {
    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .eq('category_id', categoryId)
      .order('order_index');
    
    if (error) throw error;
    return data || [];
  };

  return {
    createColumn: (categoryId: string, columnData: ColumnFormData) => 
      createMutation.mutateAsync({ categoryId, columnData }),
    updateColumn: (columnId: string, columnData: Partial<ColumnFormData>) => 
      updateMutation.mutateAsync({ columnId, columnData }),
    deleteColumn: deleteMutation.mutateAsync,
    fetchColumnsByCategory,
    // Deprecated compatibility functions
    add: (data: any) => createMutation.mutateAsync({ categoryId: data.category_id, columnData: data }),
    update: (id: string, data: any) => updateMutation.mutateAsync({ columnId: id, columnData: data }),
    remove: (id: string) => deleteMutation.mutateAsync(id),
    columns
  };
};

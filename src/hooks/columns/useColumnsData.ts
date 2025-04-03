// Fix column adapters
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnType, adaptSupabaseColumn, ColumnOption } from '@/types/column';

export const useColumnsData = (categoryId?: string) => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchColumns = useCallback(async (catId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const id = catId || categoryId;
      if (!id) {
        throw new Error('Category ID is required');
      }
      
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', id)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      
      const formattedColumns = data.map(column => {
        // Ensure the order property is set
        const columnOrder = column.order || column.order_index || 0;
        
        // Parse options and validation if needed
        const options = column.options ? column.options : [];
        const parentColumnId = column.parent_column_id || null;
        const dependsOn = column.depends_on || null;
        
        const col: Column = {
          id: column.id,
          name: column.name,
          type: column.type as ColumnType, 
          categoryId: column.category_id,
          isRequired: column.is_required,
          placeholder: column.placeholder || '',
          helpText: column.help_text || '',
          defaultValue: column.default_value || '',
          orderIndex: column.order_index,
          options: options,
          validation: column.validation || {},
          status: column.status || 'active',
          order: columnOrder,
          parentColumnId: parentColumnId,
          dependsOn: dependsOn
        };
        
        return col;
      });
      
      setColumns(formattedColumns);
    } catch (err: any) {
      console.error('Error fetching columns:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  const createColumn = useCallback(async (columnData: Omit<Column, "id" | "createdAt" | "updatedAt">) => {
    try {
      // Ensure options and validation are properly formatted
      const safeOptions = Array.isArray(columnData.options) ? columnData.options : [];
      const safeValidation = columnData.validation || {};
      
      const { data, error } = await supabase
        .from('columns')
        .insert([{
          name: columnData.name,
          category_id: columnData.categoryId,
          type: columnData.type, 
          is_required: columnData.isRequired,
          placeholder: columnData.placeholder || '',
          help_text: columnData.helpText || '',
          default_value: columnData.defaultValue || '',
          order_index: columnData.orderIndex || 0,
          options: safeOptions,
          validation: safeValidation,
          status: columnData.status || 'active',
          parent_column_id: columnData.parentColumnId,
          depends_on: columnData.dependsOn
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      const newColumn: Column = {
        id: data.id,
        name: data.name,
        type: data.type as ColumnType,
        categoryId: data.category_id,
        isRequired: data.is_required,
        placeholder: data.placeholder || '',
        helpText: data.help_text || '',
        defaultValue: data.default_value || '',
        orderIndex: data.order_index,
        options: safeOptions,
        validation: safeValidation,
        status: data.status || 'active',
        order: data.order_index || 0,
        parentColumnId: data.parent_column_id,
        dependsOn: data.depends_on
      };
      
      setColumns(prev => [...prev, newColumn]);
      return newColumn;
    } catch (err: any) {
      console.error('Error creating column:', err);
      throw err;
    }
  }, []);

  const updateColumn = useCallback(async (columnData: Column) => {
    try {
      // Ensure options and validation are properly formatted
      const safeOptions = Array.isArray(columnData.options) ? columnData.options : [];
      const safeValidation = columnData.validation || {};
      
      const { error } = await supabase
        .from('columns')
        .update({
          name: columnData.name,
          type: columnData.type.toString(),
          is_required: columnData.isRequired,
          placeholder: columnData.placeholder || '',
          help_text: columnData.helpText || '',
          default_value: columnData.defaultValue || '',
          order_index: columnData.orderIndex || 0,
          options: safeOptions,
          validation: safeValidation,
          status: columnData.status || 'active',
          parent_column_id: columnData.parentColumnId,
          depends_on: columnData.dependsOn,
          updated_at: new Date().toISOString()
        })
        .eq('id', columnData.id);
      
      if (error) throw error;
      
      setColumns(prev => 
        prev.map(col => 
          col.id === columnData.id ? { ...columnData } : col
        )
      );
      
      return columnData;
    } catch (err: any) {
      console.error('Error updating column:', err);
      throw err;
    }
  }, []);

  const deleteColumn = useCallback(async (columnId: string) => {
    try {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', columnId);
      
      if (error) throw error;
      
      setColumns(prev => prev.filter(col => col.id !== columnId));
      return true;
    } catch (err: any) {
      console.error('Error deleting column:', err);
      throw err;
    }
  }, []);

  return {
    columns,
    isLoading,
    error,
    fetchColumns,
    createColumn,
    updateColumn,
    deleteColumn
  };
};

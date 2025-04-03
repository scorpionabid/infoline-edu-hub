import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Column } from '@/types/column';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';

export const useColumnsData = (categoryId?: string) => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Kateqoriya üçün sütunları əldə etmə
  const fetchColumns = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('columns').select('*');
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query.order('order_index');

      if (error) throw error;

      // Supabase-dən gələn datanı Column tipinə çevir
      const formattedColumns = data?.map(col => ({
        ...col,
        id: col.id,
        name: col.name,
        type: col.type,
        categoryId: col.category_id,
        isRequired: col.is_required,
        placeholder: col.placeholder || '',
        helpText: col.help_text || '',
        defaultValue: col.default_value || '',
        orderIndex: col.order_index || 0,
        options: col.options || [],
        validation: col.validation || {},
        status: col.status || 'active',
        order: col.order || col.order_index || 0,
        createdAt: col.created_at,
        updatedAt: col.updated_at,
        parentColumnId: col.parent_column_id,
        dependsOn: col.depends_on
      })) as Column[];

      setColumns(formattedColumns);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Sütunları yükləyərkən xəta:', err);
      setError(err);
      setIsLoading(false);
      toast.error('Sütunlar yüklənərkən xəta baş verdi');
    }
  }, [categoryId]);

  // Yeni sütun yaratma
  const createColumn = useCallback(async (columnData: Omit<Column, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // JSON safeOptions
      const safeOptions = ["select", "multiselect", "checkbox", "radio"].includes(columnData.type) 
        ? JSON.stringify(columnData.options) 
        : null;
        
      // JSON safeValidation  
      const safeValidation = columnData.validation 
        ? JSON.stringify(columnData.validation)
        : null;
        
      // ColumnData-nı Supabase formatına çevir
      const supabaseColumnData = {
        id: uuid(),
        name: columnData.name,
        type: columnData.type,
        category_id: columnData.categoryId || columnData.category_id,
        is_required: columnData.isRequired || columnData.is_required || true,
        placeholder: columnData.placeholder || '',
        help_text: columnData.helpText || columnData.help_text || '',
        default_value: columnData.defaultValue || columnData.default_value || '',
        order_index: columnData.orderIndex || columnData.order_index || 0,
        order: columnData.order || columnData.orderIndex || 0,
        options: safeOptions,
        validation: safeValidation,
        status: columnData.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        parent_column_id: columnData.parentColumnId || columnData.parent_column_id,
        depends_on: columnData.dependsOn
      };

      const { data, error } = await supabase
        .from('columns')
        .insert([supabaseColumnData])
        .select()
        .single();

      if (error) throw error;

      // Supabase-dən gələn datanı Column tipinə çevir
      const newColumn: Column = {
        id: data.id,
        name: data.name,
        type: data.type as ColumnType,
        categoryId: data.category_id,
        isRequired: data.is_required,
        placeholder: data.placeholder || '',
        helpText: data.help_text || '',
        defaultValue: data.default_value || '',
        orderIndex: data.order_index || 0,
        options: data.options || [],
        validation: data.validation || {},
        status: data.status || 'active',
        order: data.order || data.order_index || 0,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        parentColumnId: data.parent_column_id,
        dependsOn: data.depends_on
      };

      setColumns(prev => [...prev, newColumn]);
      toast.success('Sütun uğurla yaradıldı');
      
      // Kateqoriyanın sütun sayını artır
      await updateCategoryColumnCount(columnData.categoryId || columnData.category_id as string, 1);
      
      return newColumn;
    } catch (err: any) {
      console.error('Sütun yaradılarkən xəta:', err);
      toast.error('Sütun yaradılarkən xəta baş verdi');
      throw err;
    }
  }, []);

  // Sütunu yeniləmə
  const updateColumn = useCallback(async (columnData: Column) => {
    try {
      // ColumnData-nı Supabase formatına çevir
      const supabaseColumnData = {
        name: columnData.name,
        type: columnData.type,
        category_id: columnData.categoryId,
        is_required: columnData.isRequired,
        placeholder: columnData.placeholder || '',
        help_text: columnData.helpText || '',
        default_value: columnData.defaultValue || '',
        order_index: columnData.orderIndex || 0,
        options: columnData.options || [],
        validation: columnData.validation || {},
        status: columnData.status || 'active',
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('columns')
        .update(supabaseColumnData)
        .eq('id', columnData.id)
        .select()
        .single();

      if (error) throw error;

      // Supabase-dən gələn datanı Column tipinə çevir
      const updatedColumn: Column = {
        id: data.id,
        name: data.name,
        type: data.type,
        categoryId: data.category_id,
        isRequired: data.is_required,
        placeholder: data.placeholder || '',
        helpText: data.help_text || '',
        defaultValue: data.default_value || '',
        orderIndex: data.order_index || 0,
        options: data.options || [],
        validation: data.validation || {},
        status: data.status || 'active',
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setColumns(prev => prev.map(col => 
        col.id === columnData.id ? updatedColumn : col
      ));
      
      toast.success('Sütun uğurla yeniləndi');
      return updatedColumn;
    } catch (err: any) {
      console.error('Sütun yenilənərkən xəta:', err);
      toast.error('Sütun yenilənərkən xəta baş verdi');
      throw err;
    }
  }, []);

  // Sütunu silmə
  const deleteColumn = useCallback(async (columnId: string) => {
    try {
      // Silinən sütunun kateqoriya ID-sini əldə et
      const column = columns.find(col => col.id === columnId);
      const categoryId = column?.categoryId;
      
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', columnId);

      if (error) throw error;

      setColumns(prev => prev.filter(col => col.id !== columnId));
      toast.success('Sütun uğurla silindi');
      
      // Kateqoriyanın sütun sayını azalt
      if (categoryId) {
        await updateCategoryColumnCount(categoryId, -1);
      }
      
      return true;
    } catch (err: any) {
      console.error('Sütun silinərkən xəta:', err);
      toast.error('Sütun silinərkən xəta baş verdi');
      throw err;
    }
  }, [columns]);
  
  // Kateqoriyanın sütun sayını yeniləmə
  const updateCategoryColumnCount = async (categoryId: string, change: number) => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('column_count')
        .eq('id', categoryId)
        .single();
      
      const currentCount = data?.column_count || 0;
      const newCount = Math.max(0, currentCount + change); // Neqativ olmadığından əmin ol
      
      await supabase
        .from('categories')
        .update({ column_count: newCount })
        .eq('id', categoryId);
    } catch (err) {
      console.error('Kateqoriyanın sütun sayını yeniləyərkən xəta:', err);
    }
  };

  // Komponentin ilkin yüklənməsi zamanı
  useEffect(() => {
    fetchColumns();
  }, [fetchColumns]);

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


import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Column, ColumnType, ColumnOption } from '@/types/column';

// Supabase'e göndermek için options alanını JSON'a dönüştürme
const prepareColumnForDB = (column: Partial<Column>) => {
  const preparedColumn = { ...column };
  
  // options array'sə JSON'a çevir
  if (preparedColumn.options) {
    preparedColumn.options = JSON.stringify(preparedColumn.options);
  }
  
  // validation objesini JSON'a çevir
  if (preparedColumn.validation) {
    preparedColumn.validation = JSON.stringify(preparedColumn.validation);
  }
  
  return preparedColumn;
};

export const useColumnMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Birden çox sütun əlavə etmək
  const addColumns = async (columns: Column[]): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      for (const column of columns) {
        // Hər bir sütunu JSON formatına çevir və əlavə et
        const preparedColumn = prepareColumnForDB(column);
        
        const { error } = await supabase
          .from('columns')
          .insert(preparedColumn);
          
        if (error) throw error;
      }
      
      toast.success('Sütunlar uğurla əlavə edildi');
      return true;
    } catch (err) {
      console.error('Sütunlar əlavə edilərkən xəta:', err);
      setError(err as Error);
      toast.error('Sütunlar əlavə edilərkən xəta baş verdi', {
        description: (err as Error).message
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Tək sütun əlavə etmək
  const addColumn = async (column: Column): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const preparedColumn = prepareColumnForDB(column);
      
      const { error } = await supabase
        .from('columns')
        .insert(preparedColumn);
        
      if (error) throw error;
      
      toast.success('Sütun uğurla əlavə edildi');
      return true;
    } catch (err) {
      console.error('Sütun əlavə edilərkən xəta:', err);
      setError(err as Error);
      toast.error('Sütun əlavə edilərkən xəta baş verdi', {
        description: (err as Error).message
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sütun redaktə etmək
  const updateColumn = async (id: string, column: Partial<Column>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const preparedColumn = prepareColumnForDB(column);
      
      const { error } = await supabase
        .from('columns')
        .update(preparedColumn)
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Sütun uğurla yeniləndi');
      return true;
    } catch (err) {
      console.error('Sütun yenilənərkən xəta:', err);
      setError(err as Error);
      toast.error('Sütun yenilənərkən xəta baş verdi', {
        description: (err as Error).message
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sütun silmək
  const deleteColumn = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Sütun uğurla silindi');
      return true;
    } catch (err) {
      console.error('Sütun silinərkən xəta:', err);
      setError(err as Error);
      toast.error('Sütun silinərkən xəta baş verdi', {
        description: (err as Error).message
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    addColumns,
    addColumn,
    updateColumn,
    deleteColumn
  };
};

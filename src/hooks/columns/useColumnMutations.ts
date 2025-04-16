
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { Column, ColumnOption, ColumnType } from '@/types/column';

// Helper function to convert a simple string to column option format
const convertToColumnOptions = (optionsStr: string): ColumnOption[] => {
  if (!optionsStr) return [];
  
  try {
    // Check if already in the correct format (JSON string of array)
    const parsed = JSON.parse(optionsStr);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // If not a valid JSON, treat as comma-separated values
    return optionsStr.split(',').map(option => ({
      value: option.trim(),
      label: option.trim()
    }));
  }
  
  return [];
};

export const useColumnMutations = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  
  // Create or update a column
  const saveColumn = async (column: Partial<Column>) => {
    setIsLoading(true);
    
    try {
      // Ensure required fields are present
      if (!column.category_id) {
        throw new Error(t('categoryIdRequired'));
      }
      
      if (!column.name) {
        throw new Error(t('columnNameRequired'));
      }
      
      if (!column.type) {
        throw new Error(t('columnTypeRequired'));
      }
      
      // Format options if needed
      let processedColumn = { ...column };
      
      // Convert options to the correct format if it's a string
      if (typeof processedColumn.options === 'string') {
        processedColumn.options = convertToColumnOptions(processedColumn.options);
      }
      
      // Handle upsert based on whether we have an ID
      let result;
      
      if (column.id) {
        // Update existing column
        result = await supabase
          .from('columns')
          .update({
            name: processedColumn.name,
            type: processedColumn.type,
            help_text: processedColumn.help_text,
            placeholder: processedColumn.placeholder,
            is_required: processedColumn.is_required,
            options: processedColumn.options,
            validation: processedColumn.validation,
            default_value: processedColumn.default_value,
            status: processedColumn.status,
            order_index: processedColumn.order_index
          })
          .eq('id', column.id);
      } else {
        // Create new column
        result = await supabase
          .from('columns')
          .insert({
            category_id: processedColumn.category_id,
            name: processedColumn.name,
            type: processedColumn.type,
            help_text: processedColumn.help_text,
            placeholder: processedColumn.placeholder,
            is_required: processedColumn.is_required !== false,
            options: processedColumn.options,
            validation: processedColumn.validation,
            default_value: processedColumn.default_value,
            status: processedColumn.status || 'active',
            order_index: processedColumn.order_index || 0
          });
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: column.id ? t('columnUpdated') : t('columnCreated'),
        description: column.id ? t('columnUpdatedDesc') : t('columnCreatedDesc')
      });
      
      return { success: true, data: result.data };
      
    } catch (error: any) {
      console.error('Error saving column:', error);
      toast({
        title: t('error'),
        description: error.message || t('errorSavingColumn'),
        variant: 'destructive'
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete a column
  const deleteColumn = async (columnId: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', columnId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: t('columnDeleted'),
        description: t('columnDeletedDesc')
      });
      
      return { success: true };
      
    } catch (error: any) {
      console.error('Error deleting column:', error);
      toast({
        title: t('error'),
        description: error.message || t('errorDeletingColumn'),
        variant: 'destructive'
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  return { saveColumn, deleteColumn, isLoading };
};

export default useColumnMutations;

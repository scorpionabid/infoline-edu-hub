import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Column } from '@/types/column';
import { useQueryClient } from '@tanstack/react-query';

export const useColumnMutations = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  /**
   * JSON məlumatları düzgün formatda hazırlamaq üçün utiliti funksiya
   */
  const formatJsonField = (data: any): string | null => {
    if (!data) return null;
    
    if (typeof data === 'string') {
      // Əgər artıq string formatındadırsa, JSON formatında olduğunu yoxlayaq
      try {
        // Yoxlayaq ki, düzgün JSON formatındadır
        JSON.parse(data);
        return data; // Əgər parse olunursa, deməli düzgün formatdadır
      } catch (e) {
        // Əgər parse olunmursa, JSON formatına çeviririk
        return JSON.stringify(data);
      }
    }
    
    // Əgər array və ya obyektdirsə, JSON string-ə çeviririk
    return JSON.stringify(data);
  };

  /**
   * Sütun məlumatlarını Supabase üçün hazırlayan funksiya
   */
  const prepareColumnData = (columnData: any): any => {
    const formattedData = { ...columnData };
    
    // options və validation sahələrini JSON formatında hazırlayaq
    if (columnData.options !== undefined) {
      formattedData.options = formatJsonField(columnData.options);
    }
    
    if (columnData.validation !== undefined) {
      formattedData.validation = formatJsonField(columnData.validation);
    }
    
    return formattedData;
  };

  /**
   * Supabase-dən gələn sütun məlumatlarını işləyən funksiya
   */
  const processColumnData = (columnData: any): Column => {
    const processedData = { ...columnData };
    
    // options sahəsini işləyək
    if (processedData.options) {
      try {
        if (typeof processedData.options === 'string') {
          processedData.options = JSON.parse(processedData.options);
        }
      } catch (e) {
        console.warn('Failed to parse column options:', e);
        // Xəta halında orijinal məlumatı saxlayırıq
      }
    }
    
    // validation sahəsini işləyək
    if (processedData.validation) {
      try {
        if (typeof processedData.validation === 'string') {
          processedData.validation = JSON.parse(processedData.validation);
        }
      } catch (e) {
        console.warn('Failed to parse column validation:', e);
        // Xəta halında orijinal məlumatı saxlayırıq
      }
    }
    
    return processedData as Column;
  };

  const createColumn = async (columnData: Omit<Column, 'id'>): Promise<{ success: boolean; data?: Column; error?: string }> => {
    try {
      setIsLoading(true);
      console.log('Creating column with raw data:', columnData);

      // Məlumatları Supabase üçün hazırlayaq
      const formattedData = prepareColumnData(columnData);
      console.log('Formatted data for Supabase:', formattedData);

      const { data, error } = await supabase
        .from('columns')
        .insert(formattedData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Əldə edilmiş məlumatları işləyək
      const processedData = processColumnData(data);
      console.log('Column created successfully:', processedData);

      await queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success(t('columnCreated'));

      return { success: true, data: processedData };
    } catch (error: any) {
      console.error('Error creating column:', error);
      toast.error(t('errorCreatingColumn'));
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateColumn = async (columnData: Partial<Column>): Promise<{ success: boolean; data?: Column; error?: string }> => {
    try {
      setIsLoading(true);
      console.log('Updating column with raw data:', columnData);

      // Məlumatları Supabase üçün hazırlayaq
      const formattedData = prepareColumnData(columnData);
      console.log('Formatted data for Supabase:', formattedData);

      const { data, error } = await supabase
        .from('columns')
        .update(formattedData)
        .eq('id', columnData.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Əldə edilmiş məlumatları işləyək
      const processedData = processColumnData(data);
      console.log('Column updated successfully:', processedData);

      await queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success(t('columnUpdated'));

      return { success: true, data: processedData };
    } catch (error: any) {
      console.error('Error updating column:', error);
      toast.error(t('errorUpdatingColumn'));
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteColumn = async (columnId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      console.log('Deleting column:', columnId);

      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', columnId);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Column deleted successfully');
      await queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast.success(t('columnDeleted'));

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting column:', error);
      toast.error(t('errorDeletingColumn'));
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createColumn,
    updateColumn,
    deleteColumn,
    isLoading
  };
};

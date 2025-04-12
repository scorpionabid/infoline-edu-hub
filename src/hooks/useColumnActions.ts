
import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useColumns } from './useColumns';
import { Column } from '@/types/column';
import { useQueryClient } from '@tanstack/react-query';

export const useColumnActions = () => {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const { t } = useLanguage();
  const { addColumn, updateColumn, deleteColumn } = useColumns();
  const queryClient = useQueryClient();

  // Məlumatları yeniləmək üçün helper funksiya
  const invalidateColumnsQueries = async () => {
    await queryClient.invalidateQueries({ queryKey: ['columns'] });
  };

  // Sütun əlavə etmə
  const handleAddColumn = async (columnData: Omit<Column, "id"> & { id?: string }) => {
    setIsActionLoading(true);
    try {
      if (columnData.id) {
        // Mövcud sütunu yeniləmə
        await updateColumn.mutate({
          id: columnData.id,
          ...columnData
        });
        toast.success(t('columnUpdated'));
      } else {
        // Yeni sütun əlavə etmə
        await addColumn.mutate(columnData);
        toast.success(t('columnAdded'));
      }
      
      // Məlumatları dərhal yeniləyirik
      await invalidateColumnsQueries();
      
      return true;
    } catch (error) {
      console.error('Error in handleAddColumn:', error);
      toast.error(t('error'));
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Sütun silmə
  const handleDeleteColumn = async (id: string) => {
    setIsActionLoading(true);
    try {
      await deleteColumn.mutate(id);
      toast.success(t('columnDeleted'));
      
      // Məlumatları dərhal yeniləyirik
      await invalidateColumnsQueries();
      
      return true;
    } catch (error) {
      console.error('Error in handleDeleteColumn:', error);
      toast.error(t('error'));
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Sütun statusunu yeniləmə
  const handleUpdateColumnStatus = async (id: string, status: 'active' | 'inactive') => {
    setIsActionLoading(true);
    try {
      await updateColumn.mutate({ id, status });
      toast.success(t('columnStatusUpdated'));
      
      // Məlumatları dərhal yeniləyirik
      await invalidateColumnsQueries();
      
      return true;
    } catch (error) {
      console.error('Error in handleUpdateColumnStatus:', error);
      toast.error(t('error'));
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  return {
    isActionLoading,
    handleAddColumn,
    handleDeleteColumn,
    handleUpdateColumnStatus
  };
};

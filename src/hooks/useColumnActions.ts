
import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useColumns } from './useColumns';
import { Column } from '@/types/column';

export const useColumnActions = (refetchColumns?: () => void) => {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const { t } = useLanguage();
  const { addColumn, updateColumn, deleteColumn } = useColumns();

  // Sütun əlavə etmə
  const handleAddColumn = async (columnData: Omit<Column, "id"> & { id?: string }) => {
    setIsActionLoading(true);
    try {
      if (columnData.id) {
        // Mövcud sütunu yeniləmə
        await updateColumn(columnData.id, columnData);
        toast.success(t('columnUpdated'), {
          description: t('columnUpdatedSuccessfully')
        });
      } else {
        // Yeni sütun əlavə etmə
        await addColumn(columnData);
        toast.success(t('columnAdded'), {
          description: t('columnAddedSuccessfully')
        });
      }
      
      if (refetchColumns) {
        refetchColumns();
      }
      
      return true;
    } catch (error) {
      console.error('Error in handleAddColumn:', error);
      toast.error(t('error'), {
        description: t('errorProcessingRequest')
      });
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Sütun silmə
  const handleDeleteColumn = async (id: string) => {
    setIsActionLoading(true);
    try {
      await deleteColumn(id);
      toast.success(t('columnDeleted'), {
        description: t('columnDeletedSuccessfully')
      });
      
      if (refetchColumns) {
        refetchColumns();
      }
      
      return true;
    } catch (error) {
      console.error('Error in handleDeleteColumn:', error);
      toast.error(t('error'), {
        description: t('errorProcessingRequest')
      });
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Sütun statusunu yeniləmə
  const handleUpdateColumnStatus = async (id: string, status: 'active' | 'inactive') => {
    setIsActionLoading(true);
    try {
      await updateColumn(id, { status });
      toast.success(t('columnStatusUpdated'), {
        description: t('columnStatusUpdatedSuccessfully')
      });
      
      if (refetchColumns) {
        refetchColumns();
      }
      
      return true;
    } catch (error) {
      console.error('Error in handleUpdateColumnStatus:', error);
      toast.error(t('error'), {
        description: t('errorProcessingRequest')
      });
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

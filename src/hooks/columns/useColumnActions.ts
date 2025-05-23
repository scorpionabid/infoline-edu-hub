import { useState } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Column } from '@/types/column';

export const useColumnActions = () => {
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Bu hook bir dummy ləşdirilib, əsl implementasiya gələcəkdə mərkəzi API ilə əvəz oluna bilər
  
  const handleCreateColumn = async (columnData: Partial<Column>, saveFunction: any) => {
    if (!columnData.name || !columnData.type) {
      toast.error(t('validationError'), { description: t('columnNameAndTypeRequired') });
      return;
    }
    
    setIsProcessing(true);
    try {
      const response = await saveFunction(columnData);
      
      if (response.success) {
        toast.success(t('columnCreated'), { description: t('columnCreatedDesc') });
        return response.data;
      } else {
        toast.error(t('errorCreatingColumn'), { description: response.error || t('unexpectedError') });
        return null;
      }
    } catch (error: any) {
      toast.error(t('errorCreatingColumn'), { description: error.message || t('unexpectedError') });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleUpdateColumn = async (columnData: Partial<Column>, saveFunction: any) => {
    if (!columnData.id) {
      toast.error(t('validationError'), { description: t('columnIdRequired') });
      return;
    }
    
    setIsProcessing(true);
    try {
      const response = await saveFunction(columnData);
      
      if (response.success) {
        toast.success(t('columnUpdated'), { description: t('columnUpdatedDesc') });
        return response.data;
      } else {
        toast.error(t('errorUpdatingColumn'), { description: response.error || t('unexpectedError') });
        return null;
      }
    } catch (error: any) {
      toast.error(t('errorUpdatingColumn'), { description: error.message || t('unexpectedError') });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleDeleteColumn = async (columnId: string, deleteFunction: any) => {
    if (!columnId) {
      toast.error(t('validationError'), { description: t('columnIdRequired') });
      return;
    }
    
    setIsProcessing(true);
    try {
      const response = await deleteFunction(columnId);
      
      if (response.success) {
        toast.success(t('columnDeleted'), { description: t('columnDeletedDesc') });
        return true;
      } else {
        toast.error(t('errorDeletingColumn'), { description: response.error || t('unexpectedError') });
        return false;
      }
    } catch (error: any) {
      toast.error(t('errorDeletingColumn'), { description: error.message || t('unexpectedError') });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCloneColumn = async (column: Column, saveFunction: any) => {
    if (!column.id) {
      toast.error(t('validationError'), { description: t('columnIdRequired') });
      return;
    }
    
    setIsProcessing(true);
    try {
      // Klonlanacaq sütunun məlumatlarını kopyalayaq (id istisna olmaqla)
      const { id, created_at, updated_at, ...columnDataToClone } = column;
      
      // Adının sonuna "(Copy)" əlavə edək
      columnDataToClone.name = `${columnDataToClone.name} (${t('copy')})`;
      
      const response = await saveFunction(columnDataToClone);
      
      if (response.success) {
        toast.success(t('columnCloned'), { description: t('columnClonedDesc') });
        return response.data;
      } else {
        toast.error(t('errorCloningColumn'), { description: response.error || t('unexpectedError') });
        return null;
      }
    } catch (error: any) {
      toast.error(t('errorCloningColumn'), { description: error.message || t('unexpectedError') });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    isProcessing,
    handleCreateColumn,
    handleUpdateColumn,
    handleDeleteColumn,
    handleCloneColumn
  };
};

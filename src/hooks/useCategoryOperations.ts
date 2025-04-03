
import { useState } from "react";
import { toast } from "sonner";
import { CategoryWithOrder } from "@/types/category";
import { useLanguage } from "@/context/LanguageContext";

export const useCategoryOperations = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  // Kateqoriya əlavə etmə funksiyası
  const addCategory = async (category: CategoryWithOrder) => {
    setIsLoading(true);
    try {
      // Burada əslində API sorğusu olmalıdır
      console.log("Adding category:", category);
      await new Promise(resolve => setTimeout(resolve, 500)); // Demo gecikdirmə
      
      toast.success(t('categoryAdded'), {
        description: t('categoryAddedSuccessfully'),
      });
      
      setIsLoading(false);
      return category;
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error(t('categoryAddFailed'), {
        description: t('categoryAddFailedDescription'),
      });
      setIsLoading(false);
      throw error;
    }
  };

  // Kateqoriya yeniləmə funksiyası
  const updateCategory = async (category: CategoryWithOrder) => {
    setIsLoading(true);
    try {
      console.log("Updating category:", category);
      await new Promise(resolve => setTimeout(resolve, 500)); // Demo gecikdirmə
      
      toast.success(t('categoryUpdated'), {
        description: t('categoryUpdatedSuccessfully'),
      });
      
      setIsLoading(false);
      return category;
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(t('categoryUpdateFailed'), {
        description: t('categoryUpdateFailedDescription'),
      });
      setIsLoading(false);
      throw error;
    }
  };

  // Kateqoriya silmə funksiyası
  const deleteCategory = async (categoryId: string) => {
    setIsLoading(true);
    try {
      console.log("Deleting category:", categoryId);
      await new Promise(resolve => setTimeout(resolve, 500)); // Demo gecikdirmə
      
      toast.success(t('categoryDeleted'), {
        description: t('categoryDeletedSuccessfully'),
      });
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(t('categoryDeleteFailed'), {
        description: t('categoryDeleteFailedDescription'),
      });
      setIsLoading(false);
      throw error;
    }
  };

  // Kateqoriya arxivləşdirmə funksiyası
  const archiveCategory = async (categoryId: string) => {
    setIsLoading(true);
    try {
      console.log("Archiving category:", categoryId);
      await new Promise(resolve => setTimeout(resolve, 500)); // Demo gecikdirmə
      
      toast.success(t('categoryArchived'), {
        description: t('categoryArchivedSuccessfully'),
      });
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error archiving category:", error);
      toast.error(t('categoryArchiveFailed'), {
        description: t('categoryArchiveFailedDescription'),
      });
      setIsLoading(false);
      throw error;
    }
  };

  // Kateqoriya arxivdən çıxartma funksiyası
  const restoreCategory = async (categoryId: string) => {
    setIsLoading(true);
    try {
      console.log("Restoring category:", categoryId);
      await new Promise(resolve => setTimeout(resolve, 500)); // Demo gecikdirmə
      
      toast.success(t('categoryRestored'), {
        description: t('categoryRestoredSuccessfully'),
      });
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error restoring category:", error);
      toast.error(t('categoryRestoreFailed'), {
        description: t('categoryRestoreFailedDescription'),
      });
      setIsLoading(false);
      throw error;
    }
  };

  return {
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    archiveCategory,
    restoreCategory,
  };
};

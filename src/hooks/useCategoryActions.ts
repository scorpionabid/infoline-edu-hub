
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { Category } from "@/types/category";
import { addCategory, deleteCategory, updateCategoryStatus } from "@/api/categoryApi";
import { useCacheInvalidation } from "@/context/QueryClientProvider";

// Kateqoriyaların əlavə edilməsi, silinməsi və yenilənməsi üçün hook
export const useCategoryActions = () => {
  const { t } = useLanguage();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const { invalidateQuery } = useCacheInvalidation();

  // Add new category or update existing one
  const handleAddCategory = async (categoryData: Omit<Category, "id"> & { id?: string }) => {
    setIsActionLoading(true);
    try {
      // Əgər id varsa, bu redaktə əməliyyatıdır
      const isEditing = !!categoryData.id;
      
      await addCategory(categoryData);
      
      toast.success(
        isEditing ? t("categoryUpdated") : t("categoryAdded"), 
        {
          description: isEditing 
            ? t("categoryUpdatedSuccess") 
            : t("categoryAddedSuccess"),
        }
      );
      
      // Refetch categories to update the list
      invalidateQuery(["categories"]);
      
      return true;
    } catch (error: any) {
      console.error("Error with category operation:", error);
      toast.error(
        categoryData.id ? t("categoryUpdateFailed") : t("categoryAddFailed"), 
        {
          description: categoryData.id 
            ? t("categoryUpdateFailedDesc") 
            : t("categoryAddFailedDesc"),
        }
      );
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (id: string) => {
    setIsActionLoading(true);
    try {
      await deleteCategory(id);
      
      toast.success(t("categoryDeleted"), {
        description: t("categoryDeletedSuccess"),
      });
      
      // Refetch categories to update the list
      invalidateQuery(["categories"]);
      
      return true;
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast.error(t("categoryDeleteFailed"), {
        description: t("categoryDeleteFailedDesc"),
      });
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  // Update category status
  const handleUpdateCategoryStatus = async (id: string, status: "active" | "inactive" | "draft") => {
    setIsActionLoading(true);
    try {
      await updateCategoryStatus(id, status);
      
      toast.success(t("categoryUpdated"), {
        description: t("categoryStatusUpdatedSuccess"),
      });
      
      // Refetch categories to update the list
      invalidateQuery(["categories"]);
      
      return true;
    } catch (error: any) {
      console.error("Error updating category status:", error);
      toast.error(t("categoryUpdateFailed"), {
        description: t("categoryUpdateFailedDesc"),
      });
      return false;
    } finally {
      setIsActionLoading(false);
    }
  };

  return {
    isActionLoading,
    handleAddCategory,
    handleDeleteCategory,
    handleUpdateCategoryStatus
  };
};

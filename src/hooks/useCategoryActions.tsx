
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { Category } from "@/types/category";
import { addCategory, deleteCategory, updateCategoryStatus } from "@/api/categoryApi";

// Kateqoriyaların əlavə edilməsi, silinməsi və yenilənməsi üçün hook
export const useCategoryActions = (refetch: () => Promise<any>) => {
  const { t } = useLanguage();
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Add new category
  const handleAddCategory = async (newCategory: Omit<Category, "id">) => {
    setIsActionLoading(true);
    try {
      await addCategory(newCategory);
      
      toast.success(t("categoryAdded"), {
        description: t("categoryAddedSuccess"),
      });
      
      // Refetch categories to update the list
      await refetch();
      
      return true;
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error(t("categoryAddFailed"), {
        description: t("categoryAddFailedDesc"),
      });
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
      await refetch();
      
      return true;
    } catch (error) {
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
  const handleUpdateCategoryStatus = async (id: string, status: "active" | "inactive") => {
    setIsActionLoading(true);
    try {
      await updateCategoryStatus(id, status);
      
      toast.success(t("categoryUpdated"), {
        description: t("categoryStatusUpdatedSuccess"),
      });
      
      // Refetch categories to update the list
      await refetch();
      
      return true;
    } catch (error) {
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

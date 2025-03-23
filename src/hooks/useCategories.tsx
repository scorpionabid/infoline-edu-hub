
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { Category } from "@/types/category";
import { useFiltering } from "./useFiltering";

// Fake API call to fetch categories
const fetchCategories = async (): Promise<Category[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Return mock data with improved details
  return [
    {
      id: "1",
      name: "Təcili məlumatlar",
      assignment: "all",
      createdAt: new Date("2023-01-15").toISOString(),
      updatedAt: new Date("2023-02-10").toISOString(),
      status: "active",
      priority: 1,
      description: "Məktəbin ümumi təsviri və əsas məlumatları",
      columnCount: 3,
    },
    {
      id: "2",
      name: "Tədris",
      assignment: "sectors",
      createdAt: new Date("2023-01-20").toISOString(),
      updatedAt: new Date("2023-03-05").toISOString(),
      status: "active",
      priority: 2,
      description: "Tədris planı və proqram məlumatları",
      columnCount: 2,
    },
    {
      id: "3",
      name: "İnfrastruktur",
      assignment: "all",
      createdAt: new Date("2023-02-01").toISOString(), 
      updatedAt: new Date("2023-02-20").toISOString(),
      status: "active",
      priority: 3,
      description: "Məktəbin infrastruktur və texniki məlumatları",
      columnCount: 3,
    },
    {
      id: "4",
      name: "Davamiyyət",
      assignment: "sectors",
      createdAt: new Date("2023-02-15").toISOString(),
      updatedAt: new Date("2023-04-10").toISOString(),
      status: "active",
      priority: 4,
      description: "Davamiyyət haqqında məlumatlar",
      columnCount: 3,
    },
    {
      id: "5",
      name: "Nailiyyət",
      assignment: "sectors",
      createdAt: new Date("2023-03-01").toISOString(),
      updatedAt: new Date("2023-03-25").toISOString(),
      status: "active",
      priority: 5,
      description: "Şagirdlərin akademik nailiyyətləri və statistikaları",
      columnCount: 2,
    }
  ];
};

export const useCategories = () => {
  const { t } = useLanguage();

  // Fetch categories data
  const {
    data: categories = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // İstifadə edəcəyimiz filtrasiya hook-u
  const {
    searchQuery,
    setSearchQuery,
    filteredData: filteredCategories
  } = useFiltering(categories, ["name", "description"]);

  // Add new category
  const handleAddCategory = async (newCategory: Omit<Category, "id">) => {
    try {
      // In a real app, this would be an API call
      console.log("Adding new category:", newCategory);
      
      // Simulate successful API call
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
    }
  };

  // Delete category
  const handleDeleteCategory = async (id: string) => {
    try {
      // In a real app, this would be an API call
      console.log("Deleting category with ID:", id);
      
      // Simulate successful API call
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
    }
  };

  // Update category status
  const handleUpdateCategoryStatus = async (id: string, status: "active" | "inactive") => {
    try {
      // In a real app, this would be an API call
      console.log("Updating category status:", id, status);
      
      // Simulate successful API call
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
    }
  };

  return {
    categories,
    filteredCategories,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    handleAddCategory,
    handleDeleteCategory,
    handleUpdateCategoryStatus,
  };
};

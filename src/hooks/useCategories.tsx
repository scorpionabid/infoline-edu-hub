
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { Category } from "@/types/category";

// Fake API call to fetch categories
const fetchCategories = async (): Promise<Category[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Return mock data with improved details
  return [
    {
      id: "1",
      name: "Ümumi məlumatlar",
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
      name: "Tədris planı",
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
      name: "Müəllim heyəti",
      assignment: "sectors",
      createdAt: new Date("2023-02-15").toISOString(),
      updatedAt: new Date("2023-04-10").toISOString(),
      status: "active",
      priority: 4,
      description: "Müəllim heyəti haqqında məlumatlar",
      columnCount: 0,
    },
    {
      id: "5",
      name: "Şagird nailiyyətləri",
      assignment: "sectors",
      createdAt: new Date("2023-03-01").toISOString(),
      updatedAt: new Date("2023-03-25").toISOString(),
      status: "inactive",
      priority: 5,
      description: "Şagirdlərin akademik nailiyyətləri və statistikaları",
      columnCount: 0,
    }
  ];
};

// Fake API call to fetch stats
const fetchCategoryStats = async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  return {
    totalCategories: 5,
    activeCategories: 4,
    totalColumns: 8,
    pendingApprovals: 3,
  };
};

export const useCategories = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  // Fetch category stats
  const {
    data: stats,
    isLoading: isStatsLoading,
  } = useQuery({
    queryKey: ["categoryStats"],
    queryFn: fetchCategoryStats,
  });

  // Filter categories based on search query and filters
  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesAssignment =
      assignmentFilter === "all" || 
      (assignmentFilter === "all_users" && category.assignment === "all") ||
      (assignmentFilter === "sectors_only" && category.assignment === "sectors");
    const matchesStatus =
      statusFilter === "all" || category.status === statusFilter;

    return matchesSearch && matchesAssignment && matchesStatus;
  });

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
    stats,
    isLoading,
    isStatsLoading,
    isError,
    searchQuery,
    setSearchQuery,
    assignmentFilter,
    setAssignmentFilter,
    statusFilter,
    setStatusFilter,
    handleAddCategory,
    handleDeleteCategory,
    handleUpdateCategoryStatus,
  };
};

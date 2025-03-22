
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import CategoryList from "@/components/categories/CategoryList";
import CategoryHeader from "@/components/categories/CategoryHeader";
import AddCategoryDialog from "@/components/categories/AddCategoryDialog";
import { Category } from "@/types/category";

// Fake API call to fetch categories
const fetchCategories = async (): Promise<Category[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Return mock data
  return [
    {
      id: "1",
      name: "Ümumi məlumatlar",
      assignment: "all",
      createdAt: new Date("2023-01-15").toISOString(),
      updatedAt: new Date("2023-02-10").toISOString(),
      status: "active",
      priority: 1,
    },
    {
      id: "2",
      name: "Tədris planı",
      assignment: "sectors",
      createdAt: new Date("2023-01-20").toISOString(),
      updatedAt: new Date("2023-03-05").toISOString(),
      status: "active",
      priority: 2,
    },
    {
      id: "3",
      name: "İnfrastruktur",
      assignment: "all",
      createdAt: new Date("2023-02-01").toISOString(), 
      updatedAt: new Date("2023-02-20").toISOString(),
      status: "active",
      priority: 3,
    },
    {
      id: "4",
      name: "Müəllim heyəti",
      assignment: "sectors",
      createdAt: new Date("2023-02-15").toISOString(),
      updatedAt: new Date("2023-04-10").toISOString(),
      status: "active",
      priority: 4,
    },
    {
      id: "5",
      name: "Şagird nailiyyətləri",
      assignment: "sectors",
      createdAt: new Date("2023-03-01").toISOString(),
      updatedAt: new Date("2023-03-25").toISOString(),
      status: "inactive",
      priority: 5,
    }
  ];
};

const Categories = () => {
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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

  // Filter categories based on search query and filters
  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesAssignment =
      assignmentFilter === "all" || category.assignment === assignmentFilter;
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

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <CategoryHeader
          onAddCategory={() => setIsAddDialogOpen(true)}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
          assignmentFilter={assignmentFilter}
          onAssignmentFilterChange={setAssignmentFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        <CategoryList
          categories={filteredCategories}
          isLoading={isLoading}
          isError={isError}
          onDeleteCategory={handleDeleteCategory}
          onUpdateStatus={handleUpdateCategoryStatus}
        />

        <AddCategoryDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onAddCategory={handleAddCategory}
        />
      </div>
    </SidebarLayout>
  );
};

export default Categories;

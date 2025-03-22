
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import { Column, CategoryWithColumns } from "@/types/column";
import { Category } from "@/types/category";
import ColumnList from "@/components/columns/ColumnList";
import ColumnHeader from "@/components/columns/ColumnHeader";
import AddColumnDialog from "@/components/columns/AddColumnDialog";
import ImportColumnsDialog from "@/components/columns/ImportColumnsDialog";

// Fake API call to fetch categories
const fetchCategories = async (): Promise<Category[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
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
  ];
};

// Fake API call to fetch columns
const fetchColumns = async (): Promise<Column[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1200));
  
  // Return mock data
  return [
    {
      id: "1",
      categoryId: "1",
      name: "Məktəbin adı",
      type: "text",
      isRequired: true,
      placeholder: "Məktəbin tam adını daxil edin",
      helpText: "Məktəbin rəsmi adını daxil edin",
      order: 1,
      status: "active",
    },
    {
      id: "2",
      categoryId: "1",
      name: "Şagird sayı",
      type: "number",
      isRequired: true,
      validationRules: {
        minValue: 0,
        maxValue: 10000,
      },
      placeholder: "Ümumi şagird sayını daxil edin",
      order: 2,
      status: "active",
    },
    {
      id: "3",
      categoryId: "1",
      name: "Təhsil növü",
      type: "select",
      isRequired: true,
      options: ["Ümumi", "Texniki", "Humanitar", "Digər"],
      order: 3,
      status: "active",
    },
    {
      id: "4",
      categoryId: "2",
      name: "Tədris dili",
      type: "radio",
      isRequired: true,
      options: ["Azərbaycan", "Rus", "İngilis", "Türk"],
      order: 1,
      status: "active",
    },
    {
      id: "5",
      categoryId: "2",
      name: "Həftəlik saat",
      type: "number",
      isRequired: true,
      validationRules: {
        minValue: 1,
        maxValue: 50,
      },
      order: 2,
      status: "active",
    },
    {
      id: "6",
      categoryId: "3",
      name: "Laboratoriya mövcudluğu",
      type: "checkbox",
      isRequired: false,
      options: ["Fizika", "Kimya", "Biologiya", "İnformatika"],
      order: 1,
      status: "active",
    },
    {
      id: "7",
      categoryId: "3",
      name: "Binanın tikildiyi il",
      type: "date",
      isRequired: true,
      order: 2,
      status: "inactive",
    },
    {
      id: "8",
      categoryId: "3",
      name: "Binanın fotosu",
      type: "image",
      isRequired: false,
      order: 3,
      status: "active",
    }
  ];
};

const Columns = () => {
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [columnToEdit, setColumnToEdit] = useState<Column | undefined>(undefined);

  // Fetch categories data
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Fetch columns data
  const {
    data: columns = [],
    isLoading: isColumnsLoading,
    isError: isColumnsError,
    refetch: refetchColumns,
  } = useQuery({
    queryKey: ["columns"],
    queryFn: fetchColumns,
  });

  // Filter columns based on search query and filters
  const filteredColumns = columns.filter((column) => {
    const matchesSearch = column.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || column.categoryId === categoryFilter;
    const matchesType =
      typeFilter === "all" || column.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || column.status === statusFilter;

    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  // Add/Edit column
  const handleAddOrEditColumn = async (columnData: Omit<Column, "id">) => {
    try {
      // In a real app, this would be an API call
      console.log("Adding/editing column:", columnData);
      
      // Simulate successful API call
      const actionType = columnToEdit ? "updated" : "added";
      
      toast.success(t(columnToEdit ? "columnUpdated" : "columnAdded"), {
        description: t(columnToEdit ? "columnUpdatedSuccess" : "columnAddedSuccess"),
      });
      
      // Clear edit state
      setColumnToEdit(undefined);
      
      // Refetch columns to update the list
      await refetchColumns();
      
      return true;
    } catch (error) {
      console.error("Error adding/editing column:", error);
      toast.error(t(columnToEdit ? "columnUpdateFailed" : "columnAddFailed"), {
        description: t(columnToEdit ? "columnUpdateFailedDesc" : "columnAddFailedDesc"),
      });
      return false;
    }
  };

  // Delete column
  const handleDeleteColumn = async (id: string) => {
    try {
      // In a real app, this would be an API call
      console.log("Deleting column with ID:", id);
      
      // Simulate successful API call
      toast.success(t("columnDeleted"), {
        description: t("columnDeletedSuccess"),
      });
      
      // Refetch columns to update the list
      await refetchColumns();
      
      return true;
    } catch (error) {
      console.error("Error deleting column:", error);
      toast.error(t("columnDeleteFailed"), {
        description: t("columnDeleteFailedDesc"),
      });
      return false;
    }
  };

  // Update column status
  const handleUpdateColumnStatus = async (id: string, status: "active" | "inactive") => {
    try {
      // In a real app, this would be an API call
      console.log("Updating column status:", id, status);
      
      // Simulate successful API call
      toast.success(t("columnUpdated"), {
        description: t("columnStatusUpdatedSuccess"),
      });
      
      // Refetch columns to update the list
      await refetchColumns();
      
      return true;
    } catch (error) {
      console.error("Error updating column status:", error);
      toast.error(t("columnUpdateFailed"), {
        description: t("columnUpdateFailedDesc"),
      });
      return false;
    }
  };

  // Handle column edit
  const handleEditColumn = (column: Column) => {
    setColumnToEdit(column);
    setIsAddDialogOpen(true);
  };

  // Handle template export
  const handleExportTemplate = () => {
    // In a real app, this would generate and download an Excel template
    console.log("Exporting Excel template");
    
    toast.success(t("templateExported"), {
      description: t("templateExportedSuccess"),
    });
  };

  // Handle columns import
  const handleImportColumns = async (file: File) => {
    try {
      // In a real app, this would process the Excel file and import columns
      console.log("Importing columns from file:", file.name);
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful import
      toast.success(t("columnsImported"), {
        description: t("columnsImportedSuccess"),
      });
      
      // Refetch columns to update the list
      await refetchColumns();
      
      return true;
    } catch (error) {
      console.error("Error importing columns:", error);
      toast.error(t("importFailed"), {
        description: t("importFailedDesc"),
      });
      return false;
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <ColumnHeader
          onAddColumn={() => {
            setColumnToEdit(undefined);
            setIsAddDialogOpen(true);
          }}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          categories={categories}
          onExportTemplate={handleExportTemplate}
          onImportColumns={() => setIsImportDialogOpen(true)}
        />

        <ColumnList
          columns={filteredColumns}
          categories={categories}
          isLoading={isColumnsLoading || isCategoriesLoading}
          isError={isColumnsError}
          onDeleteColumn={handleDeleteColumn}
          onUpdateStatus={handleUpdateColumnStatus}
          onEditColumn={handleEditColumn}
        />

        <AddColumnDialog
          isOpen={isAddDialogOpen}
          onClose={() => {
            setIsAddDialogOpen(false);
            setColumnToEdit(undefined);
          }}
          onAddColumn={handleAddOrEditColumn}
          categories={categories}
          editColumn={columnToEdit}
          columns={columns}
        />

        <ImportColumnsDialog
          isOpen={isImportDialogOpen}
          onClose={() => setIsImportDialogOpen(false)}
          onImportColumns={handleImportColumns}
        />
      </div>
    </SidebarLayout>
  );
};

export default Columns;

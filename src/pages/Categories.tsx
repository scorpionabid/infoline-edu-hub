
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import CategoryList from "@/components/categories/CategoryList";
import CategoryHeader from "@/components/categories/CategoryHeader";
import AddCategoryDialog from "@/components/categories/AddCategoryDialog";
import { Category } from "@/types/category";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FileBarChart } from "lucide-react";

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

const Categories = () => {
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("list");

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

  // Stats display component
  const StatsDisplay = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold">{isStatsLoading ? "..." : stats?.totalCategories}</div>
            <p className="text-muted-foreground">{t("totalCategories")}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold">{isStatsLoading ? "..." : stats?.activeCategories}</div>
            <p className="text-muted-foreground">{t("activeCategories")}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold">{isStatsLoading ? "..." : stats?.totalColumns}</div>
            <p className="text-muted-foreground">{t("totalColumns")}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold">{isStatsLoading ? "..." : stats?.pendingApprovals}</div>
            <p className="text-muted-foreground">{t("pendingApprovals")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

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

        <StatsDisplay />

        <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="list">
              <Database className="h-4 w-4 mr-2" />
              {t("categoryList")}
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <FileBarChart className="h-4 w-4 mr-2" />
              {t("analytics")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list">
            <CategoryList
              categories={filteredCategories}
              isLoading={isLoading}
              isError={isError}
              onDeleteCategory={handleDeleteCategory}
              onUpdateStatus={handleUpdateCategoryStatus}
            />
          </TabsContent>
          <TabsContent value="analytics">
            <Card>
              <CardContent className="pt-6">
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <FileBarChart className="h-16 w-16 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">{t("categoryAnalytics")}</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                      {t("categoryAnalyticsDescription")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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

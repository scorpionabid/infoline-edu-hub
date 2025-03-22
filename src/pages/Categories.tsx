
import React, { useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useLanguage } from "@/context/LanguageContext";
import CategoryList from "@/components/categories/CategoryList";
import CategoryHeader from "@/components/categories/CategoryHeader";
import CategoryStats from "@/components/categories/CategoryStats";
import CategoryAnalytics from "@/components/categories/CategoryAnalytics";
import AddCategoryDialog from "@/components/categories/AddCategoryDialog";
import { useCategories } from "@/hooks/useCategories";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, FileBarChart } from "lucide-react";

const Categories = () => {
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  
  const { 
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
    handleUpdateCategoryStatus
  } = useCategories();

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

        <CategoryStats stats={stats} isLoading={isStatsLoading} />

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
            <CategoryAnalytics />
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

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import CategoryItem from "./CategoryItem";
import { PlusIcon } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import CreateCategoryDialog from "./CreateCategoryDialog";
import { useLanguage } from "@/context/LanguageContext";
import { Category, CategoryStatus } from "@/types/category";
// Import EmptyState directly instead of using named import
import EmptyState from "@/components/ui/empty-state";

interface CategoryListProps {
  onCategorySelect?: (categoryId: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ onCategorySelect }) => {
  const { categories, isLoading, error, refetch } = useCategories();
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<CategoryStatus>("active");

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleTabChange = (tab: CategoryStatus) => {
    setActiveTab(tab);
  };

  const filteredCategories = categories?.filter((category) => category.status === activeTab);

  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect?.(categoryId);
  };

  return (
    <>
      <div className="md:flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t("categories")}</h2>
        <Button onClick={() => setOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          {t("newCategory")}
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active" onClick={() => handleTabChange("active")}>
            {t("active")}
          </TabsTrigger>
          <TabsTrigger value="inactive" onClick={() => handleTabChange("inactive")}>
            {t("inactive")}
          </TabsTrigger>
          <TabsTrigger value="draft" onClick={() => handleTabChange("draft")}>
            {t("draft")}
          </TabsTrigger>
          <TabsTrigger value="archived" onClick={() => handleTabChange("archived")}>
            {t("archived")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          {isLoading ? (
            <p>{t("loadingCategories")}</p>
          ) : error ? (
            <p className="text-red-500">{error.message}</p>
          ) : filteredCategories && filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  onCategorySelect={handleCategorySelect}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={t("noActiveCategories")}
              description={t("noActiveCategoriesDescription")}
            />
          )}
        </TabsContent>
        <TabsContent value="inactive">
          {isLoading ? (
            <p>{t("loadingCategories")}</p>
          ) : error ? (
            <p className="text-red-500">{error.message}</p>
          ) : filteredCategories && filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  onCategorySelect={handleCategorySelect}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={t("noInactiveCategories")}
              description={t("noInactiveCategoriesDescription")}
            />
          )}
        </TabsContent>
        <TabsContent value="draft">
          {isLoading ? (
            <p>{t("loadingCategories")}</p>
          ) : error ? (
            <p className="text-red-500">{error.message}</p>
          ) : filteredCategories && filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  onCategorySelect={handleCategorySelect}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={t("noDraftCategories")}
              description={t("noDraftCategoriesDescription")}
            />
          )}
        </TabsContent>
        <TabsContent value="archived">
          {isLoading ? (
            <p>{t("loadingCategories")}</p>
          ) : error ? (
            <p className="text-red-500">{error.message}</p>
          ) : filteredCategories && filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  onCategorySelect={handleCategorySelect}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={t("noArchivedCategories")}
              description={t("noArchivedCategoriesDescription")}
            />
          )}
        </TabsContent>
      </Tabs>

      <CreateCategoryDialog open={open} setOpen={setOpen} onSuccess={() => refetch()} />
    </>
  );
};

export default CategoryList;


import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CategoryItem from "./CategoryItem";
import { PlusIcon } from "lucide-react";
import { useCategories } from "@/hooks/categories";
import CreateCategoryDialog from "./CreateCategoryDialog";
import { useLanguage } from "@/context/LanguageContext";
import { CategoryStatus } from "@/types/category";
import EmptyState from "@/components/ui/empty-state";
import { toast } from "sonner";

interface CategoryListProps {
  onCategorySelect?: (categoryId: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ onCategorySelect }) => {
  const { categories, isLoading, error, refetch } = useCategories();
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<CategoryStatus>("active");

  useEffect(() => {
    console.log("Fetching categories in CategoryList...");
    refetch();
  }, [refetch]);

  const handleTabChange = (tab: CategoryStatus) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    if (error) {
      toast.error("Failed to load categories", {
        description: error.message || "An unknown error occurred",
      });
    }
  }, [error]);

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

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="p-8 text-center">
              <p>{t("loadingCategories")}</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              <p>{error.message || "Failed to load categories"}</p>
            </div>
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
              title={t("noCategories")}
              description={t("noCategoriesDescription")}
            />
          )}
        </TabsContent>
      </Tabs>

      <CreateCategoryDialog open={open} setOpen={setOpen} onSuccess={() => refetch()} />
    </>
  );
};

export default CategoryList;

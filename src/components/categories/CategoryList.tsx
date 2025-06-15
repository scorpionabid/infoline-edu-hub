
import { useEffect, useState, useCallback, useRef } from "react";
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
  const { categories, loading, error, refetch } = useCategories();
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<CategoryStatus>("active");
  
  // Add refs to prevent excessive refetches and track mount state
  const didMountRef = useRef(false);
  const lastRefetchTime = useRef(Date.now());
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Optimize refetch with useCallback and debounce
  const safeRefetch = useCallback(() => {
    const now = Date.now();
    
    // Clear any pending timeout
    if (refetchTimeoutRef.current) {
      clearTimeout(refetchTimeoutRef.current);
      refetchTimeoutRef.current = null;
    }
    
    // Only refetch if 2 seconds have passed since the last refetch
    if (now - lastRefetchTime.current > 2000) {
      lastRefetchTime.current = now;
      console.log("Refetching categories...");
      refetch();
    } else {
      // Schedule a delayed refetch
      console.log("Delaying refetch - too soon after last one");
      refetchTimeoutRef.current = setTimeout(() => {
        lastRefetchTime.current = Date.now();
        console.log("Executing delayed refetch of categories...");
        refetch();
        refetchTimeoutRef.current = null;
      }, 2000);
    }
  }, [refetch]);

  // Initial fetch only on mount
  useEffect(() => {
    if (!didMountRef.current) {
      console.log("Initial fetch of categories...");
      refetch();
      didMountRef.current = true;
    }
    
    // Clean up any pending timeout on unmount
    return () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
      }
    };
  }, [refetch]);

  const handleTabChange = (tab: CategoryStatus) => {
    setActiveTab(tab);
  };

  // Handle errors in a separate effect
  useEffect(() => {
    if (error) {
      const errorMessage = typeof error === 'string' ? error : 'An unknown error occurred';
      toast.error("Failed to load categories", {
        description: errorMessage,
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
          {loading ? (
            <div className="p-8 text-center">
              <p>{t("loadingCategories")}</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              <p>{typeof error === 'string' ? error : "Failed to load categories"}</p>
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

      {/* Use the safeRefetch callback for dialog success */}
      <CreateCategoryDialog open={open} setOpen={setOpen} onSuccess={safeRefetch} />
    </>
  );
};

export default CategoryList;

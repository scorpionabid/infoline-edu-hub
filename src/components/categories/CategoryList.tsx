
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
  searchQuery?: string;
  filters?: {
    status: string;
    assignment: string;
  };
}

const CategoryList: React.FC<CategoryListProps> = ({ 
  onCategorySelect, 
  searchQuery = '', 
  filters = { status: '', assignment: '' }
}) => {
  const { categories, loading, error, refetch } = useCategories();
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<CategoryStatus>("active");
  
  const didMountRef = useRef(false);
  const lastRefetchTime = useRef(Date.now());
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const safeRefetch = useCallback(() => {
    const now = Date.now();
    
    if (refetchTimeoutRef.current) {
      clearTimeout(refetchTimeoutRef.current);
      refetchTimeoutRef.current = null;
    }
    
    if (now - lastRefetchTime.current > 2000) {
      lastRefetchTime.current = now;
      console.log("Refetching categories...");
      refetch();
    } else {
      console.log("Delaying refetch - too soon after last one");
      refetchTimeoutRef.current = setTimeout(() => {
        lastRefetchTime.current = Date.now();
        console.log("Executing delayed refetch of categories...");
        refetch();
        refetchTimeoutRef.current = null;
      }, 2000);
    }
  }, [refetch]);

  useEffect(() => {
    if (!didMountRef.current) {
      console.log("Initial fetch of categories...");
      refetch();
      didMountRef.current = true;
    }
    
    return () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
      }
    };
  }, [refetch]);

  const handleTabChange = (tab: CategoryStatus) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    if (error) {
      const errorMessage = typeof error === 'string' ? error : 'Naməlum xəta baş verdi';
      toast.error("Kateqoriyalar yüklənə bilmədi", {
        description: errorMessage,
      });
    }
  }, [error]);

  // Filter categories based on search and filters
  const filteredCategories = categories?.filter((category) => {
    // Tab filter
    if (category.status !== activeTab) return false;
    
    // Search filter
    if (searchQuery && !category.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Status filter (if different from tab)
    if (filters.status && filters.status !== category.status) return false;
    
    // Assignment filter
    if (filters.assignment && filters.assignment !== category.assignment) return false;
    
    return true;
  });

  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect?.(categoryId);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-100/80 backdrop-blur-sm">
          <TabsTrigger 
            value="active" 
            onClick={() => handleTabChange("active")}
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Aktiv
          </TabsTrigger>
          <TabsTrigger 
            value="inactive" 
            onClick={() => handleTabChange("inactive")}
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Deaktiv
          </TabsTrigger>
          <TabsTrigger 
            value="draft" 
            onClick={() => handleTabChange("draft")}
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Qaralama
          </TabsTrigger>
          <TabsTrigger 
            value="archived" 
            onClick={() => handleTabChange("archived")}
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            Arxivlənmiş
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3 text-slate-600">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                <p className="text-lg">Kateqoriyalar yüklənir...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="text-red-500 text-lg font-medium">
                  Kateqoriyalar yüklənə bilmədi
                </div>
                <Button onClick={safeRefetch} variant="outline" className="mt-4">
                  Yenidən cəhd et
                </Button>
              </div>
            </div>
          ) : filteredCategories && filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              title={searchQuery || filters.status || filters.assignment ? "Heç bir kateqoriya tapılmadı" : "Kateqoriya yoxdur"}
              description={searchQuery || filters.status || filters.assignment ? 
                "Axtarış kriteriyalarını dəyişdirməyə çalışın" : 
                "Hələ heç bir kateqoriya yaradılmayıb"
              }
            />
          )}
        </TabsContent>
      </Tabs>

      <CreateCategoryDialog open={open} setOpen={setOpen} onSuccess={safeRefetch} />
    </div>
  );
};

export default CategoryList;

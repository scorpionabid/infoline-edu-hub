
import { useEffect, useState, useCallback, useRef } from "react";
import CategoryItem from "./CategoryItem";
import { useCategories } from "@/hooks/categories";
import { useLanguage } from "@/context/LanguageContext";
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
  const { t } = useLanguage();
  
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

  useEffect(() => {
    if (error) {
      const errorMessage = typeof error === 'string' ? error : 'Naməlum xəta baş verdi';
      toast.error("Kateqoriyalar yüklənə bilmədi", {
        description: errorMessage,
      });
    }
  }, [error]);

  // Filter categories based on search and filters passed from parent
  const filteredCategories = categories?.filter((category) => {
    // Status filter (from tab system)
    if (filters.status && category.status !== filters.status) return false;
    
    // Search filter
    if (searchQuery && !category.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Assignment filter
    if (filters.assignment && filters.assignment !== 'all' && filters.assignment !== category.assignment) {
      return false;
    }
    
    return true;
  });

  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect?.(categoryId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center space-x-4 text-slate-600">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-blue-600 border-t-transparent"></div>
          <p className="text-xl font-medium">Kateqoriyalar yüklənir...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-xl font-semibold">
            Kateqoriyalar yüklənə bilmədi
          </div>
          <button 
            onClick={safeRefetch} 
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Yenidən cəhd et
          </button>
        </div>
      </div>
    );
  }

  if (!filteredCategories || filteredCategories.length === 0) {
    return (
      <EmptyState
        title={searchQuery || filters.assignment ? "Heç bir kateqoriya tapılmadı" : "Kateqoriya yoxdur"}
        description={searchQuery || filters.assignment ? 
          "Axtarış kriteriyalarını dəyişdirməyə çalışın" : 
          "Hələ heç bir kateqoriya yaradılmayıb"
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredCategories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          onCategorySelect={handleCategorySelect}
        />
      ))}
    </div>
  );
};

export default CategoryList;

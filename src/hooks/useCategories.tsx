
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { Category } from "@/types/category";
import { useFiltering } from "./useFiltering";
import { fetchCategories } from "@/api/categoryApi";
import { useCategoryActions } from "./useCategoryActions";

export const useCategories = () => {
  const { t } = useLanguage();

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

  // İstifadə edəcəyimiz filtrasiya hook-u
  const {
    searchQuery,
    setSearchQuery,
    filteredData: filteredCategories
  } = useFiltering(categories, ["name", "description"]);

  // Kateqoriya əməliyyatları üçün hook-u istifadə edirik
  const {
    isActionLoading,
    handleAddCategory,
    handleDeleteCategory,
    handleUpdateCategoryStatus
  } = useCategoryActions(refetch);

  return {
    categories,
    filteredCategories,
    isLoading,
    isError,
    isActionLoading,
    searchQuery,
    setSearchQuery,
    handleAddCategory,
    handleDeleteCategory,
    handleUpdateCategoryStatus,
  };
};


import { useState, useCallback } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { Category } from "@/types/category";
import { useFiltering } from "./useFiltering";
import { fetchCategories } from "@/api/categoryApi";

export const useCategories = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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

  // Yeniləmə funksiyası
  const refreshCategories = useCallback(async () => {
    try {
      await refetch();
    } catch (err: any) {
      setError(err);
    }
  }, [refetch]);

  return {
    categories,
    filteredCategories,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    refetch: refreshCategories,
  };
};

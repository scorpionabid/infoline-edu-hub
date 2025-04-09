
import { useQuery } from "@tanstack/react-query";
import { useFiltering } from "./useFiltering";
import { fetchCategories } from "@/api/categoryApi";
import { Category } from "@/types/category";

export const useCategories = () => {
  // Fetch categories data
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // İstifadə edəcəyimiz filtrasiya hook-u
  const {
    searchQuery,
    setSearchQuery,
    filteredData: filteredCategories
  } = useFiltering(categories, ["name", "description"]);

  return {
    categories,
    filteredCategories,
    isLoading,
    isError,
    error,
    searchQuery,
    setSearchQuery,
    refetch,
  };
};

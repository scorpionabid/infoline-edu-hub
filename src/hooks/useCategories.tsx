
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/api/categoryApi";
import { Category } from "@/types/category";
import { useState, useMemo } from "react";

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

  // Axtarış üçün state və funksiya
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrelənmiş kateqoriyalar
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    
    return categories.filter((category) => {
      const nameMatch = category.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = category.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatch || descMatch;
    });
  }, [categories, searchQuery]);

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

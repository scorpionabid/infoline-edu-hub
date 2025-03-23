
import { useState, useMemo } from "react";

/**
 * Verilənləri filtrasiya etmək üçün ortaq hook
 * @param data - Filtrasiya ediləcək məlumatlar
 * @param searchableFields - Axtarış aparılacaq sahələr
 * @returns Filtrasiya üçün funksionallıq
 */
export const useFiltering = <T extends Record<string, any>>(
  data: T[],
  searchableFields: Array<keyof T>
) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Bütün filtrasiya məntiqini bir yerdə idarə edir
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Axtarış sorğusunu yoxlayır
      const matchesSearch = searchQuery === "" || searchableFields.some(field => {
        const value = item[field];
        return value && String(value).toLowerCase().includes(searchQuery.toLowerCase());
      });

      // Filtrləri yoxlayır
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (value === "all") return true;
        
        // Xüsusi hallar üçün (məsələn, kateqoriya statusları)
        if (key === "status" && value === "active") return item.status === "active";
        if (key === "status" && value === "inactive") return item.status === "inactive";
        
        // Ümumi filtrasiya
        return item[key] === value || 
              (Array.isArray(item[key]) && item[key].includes(value));
      });

      return matchesSearch && matchesFilters;
    });
  }, [data, searchQuery, filters, searchableFields]);

  // Spesifik bir filtr dəyərini yeniləmək üçün
  const updateFilter = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  return {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    filteredData
  };
};

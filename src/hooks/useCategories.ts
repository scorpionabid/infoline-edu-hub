
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from 'react';
import { fetchCategories } from "@/api/categoryApi";
import { Category } from "@/types/category";

export const useCategories = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('');
  
  // Fetch categories data
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // Filtrlənmiş kateqoriyalar
  const filteredCategories = useMemo(() => {
    return categories.filter((category: Category) => {
      // Axtarış filtri
      if (searchQuery && !category.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(category.description?.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      
      // Status filtri
      if (statusFilter && statusFilter !== 'all' && category.status !== statusFilter) {
        return false;
      }
      
      // Assignment filtri
      if (assignmentFilter && assignmentFilter !== '' && category.assignment !== assignmentFilter) {
        return false;
      }
      
      return true;
    });
  }, [categories, searchQuery, statusFilter, assignmentFilter]);

  // Kateqoriyaların statistikası
  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter(c => c.status === 'active').length;
    const inactive = categories.filter(c => c.status === 'inactive').length;
    const draft = categories.filter(c => c.status === 'draft').length;
    
    const assignment = {
      all: categories.filter(c => c.assignment === 'all').length,
      sectors: categories.filter(c => c.assignment === 'sectors').length
    };
    
    const withDeadline = categories.filter(c => c.deadline).length;
    
    return {
      total,
      active,
      inactive,
      draft,
      assignment,
      withDeadline
    };
  }, [categories]);

  return {
    categories,
    filteredCategories,
    isLoading,
    isError,
    error,
    refetch,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    assignmentFilter,
    setAssignmentFilter,
    stats
  };
};

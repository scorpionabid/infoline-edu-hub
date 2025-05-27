import { useState, useCallback, useMemo } from 'react';
import { School } from '@/types/supabase';

interface UseSchoolPaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  paginatedSchools: School[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
}

export const useSchoolPagination = (
  schools: School[] = [],
  initialPageSize: number = 10
): UseSchoolPaginationReturn => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  // Səhifələrin ümumi sayını hesablayaq
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(schools.length / pageSize));
  }, [schools.length, pageSize]);
  
  // Cari səhifənin məlumatlarını əldə edək
  const paginatedSchools = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return schools.slice(startIndex, startIndex + pageSize);
  }, [schools, currentPage, pageSize]);
  
  // Səhifələmə funksiyaları
  const goToPage = useCallback((page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  }, [totalPages]);
  
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);
  
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);
  
  // Səhifə ölçüsünü dəyişmək
  const handleSetPageSize = useCallback((size: number) => {
    const newSize = Math.max(1, size);
    setPageSize(newSize);
    
    // Əgər cari səhifə yeni səhifə sayından çoxdursa, axırıncı səhifəyə keçmək
    const newTotalPages = Math.max(1, Math.ceil(schools.length / newSize));
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  }, [schools.length, currentPage]);
  
  return {
    currentPage,
    pageSize,
    totalPages,
    paginatedSchools,
    goToPage,
    nextPage,
    prevPage,
    setPageSize: handleSetPageSize
  };
};

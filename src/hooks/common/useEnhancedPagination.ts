import React from 'react';

export interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
}

export interface FilterOptions {
  search?: string;
  regionId?: string;
  sectorId?: string;
  status?: string;
}

export interface SortOptions {
  field: string | null;
  direction: 'asc' | 'desc' | null;
}

export interface UsePaginationReturn<T> {
  // Pagination
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
  paginatedItems: T[];
  
  // Pagination actions
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
  
  // Filtering
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  filteredItems: T[];
  
  // Sorting
  sortOptions: SortOptions;
  setSortOptions: (sort: SortOptions) => void;
  sortedItems: T[];
  
  // Combined (filtered + sorted + paginated)
  processedItems: T[];
}

export function useEnhancedPagination<T>(
  items: T[],
  initialPageSize = 10,
  filterFunction?: (item: T, filters: FilterOptions) => boolean,
  sortFunction?: (a: T, b: T, sortOptions: SortOptions) => number
): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [currentPageSize, setCurrentPageSize] = React.useState(initialPageSize);
  const [filters, setFilters] = React.useState<FilterOptions>({});
  const [sortOptions, setSortOptions] = React.useState<SortOptions>({
    field: null,
    direction: null
  });

  // 1. Apply filtering
  const filteredItems = React.useMemo(() => {
    if (!filterFunction) return items;
    
    return items.filter(item => filterFunction(item, filters));
  }, [items, filters, filterFunction]);

  // 2. Apply sorting
  const sortedItems = React.useMemo(() => {
    if (!sortFunction || !sortOptions.field || !sortOptions.direction) {
      return filteredItems;
    }

    return [...filteredItems].sort((a, b) => sortFunction(a, b, sortOptions));
  }, [filteredItems, sortOptions, sortFunction]);

  // 3. Calculate pagination values
  const totalItems = sortedItems.length;
  const totalPages = Math.ceil(totalItems / currentPageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
  const startIndex = (currentPage - 1) * currentPageSize;
  const endIndex = Math.min(startIndex + currentPageSize, totalItems);

  // 4. Apply pagination
  const paginatedItems = React.useMemo(() => {
    return sortedItems.slice(startIndex, endIndex);
  }, [sortedItems, startIndex, endIndex]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Reset to first page when sort changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sortOptions]);

  // Ensure current page is valid
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const previousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const updatePageSize = (size: number) => {
    setCurrentPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  return {
    // Pagination
    currentPage,
    pageSize: currentPageSize,
    totalPages,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    paginatedItems,
    
    // Pagination actions
    goToPage,
    nextPage,
    previousPage,
    prevPage: previousPage,
    setPageSize: updatePageSize,
    
    // Filtering
    filters,
    setFilters,
    filteredItems,
    
    // Sorting
    sortOptions,
    setSortOptions,
    sortedItems,
    
    // Combined result
    processedItems: paginatedItems
  };
}
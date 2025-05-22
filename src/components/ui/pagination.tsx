
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  previousLabel?: string;
  nextLabel?: string;
  pageLabel?: (page: number) => string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  previousLabel = "Previous",
  nextLabel = "Next",
  pageLabel = (page) => `Page ${page}`
}: PaginationProps) {
  // Keep track of last rendered page to prevent unnecessary re-renders
  const lastPageRef = useRef(currentPage);
  const [internalPage, setInternalPage] = useState(currentPage);
  const pageChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Sync with external changes to currentPage
  useEffect(() => {
    if (currentPage !== internalPage) {
      console.log(`Pagination: External page change detected from ${internalPage} to ${currentPage}`);
      setInternalPage(currentPage);
      lastPageRef.current = currentPage;
    }
  }, [currentPage, internalPage]);
  
  // Compute page numbers to show based on current page
  const getPageNumbers = () => {
    const delta = 1; // Number of pages to show on either side of current page
    const pages = [];
    
    // Pages before current page
    for (let i = Math.max(2, internalPage - delta); i < internalPage; i++) {
      pages.push(i);
    }
    
    // Current page (only if not first or last)
    if (internalPage > 1 && internalPage < totalPages) {
      pages.push(internalPage);
    }
    
    // Pages after current page
    for (let i = internalPage + 1; i <= Math.min(totalPages - 1, internalPage + delta); i++) {
      pages.push(i);
    }
    
    // Add ellipsis if needed before
    if (pages.length > 0 && pages[0] > 2) {
      pages.unshift("...");
    }
    
    // Always add first page if there are pages
    if (totalPages > 1) {
      pages.unshift(1);
    }
    
    // Add ellipsis if needed after
    if (pages.length > 0 && pages[pages.length - 1] < totalPages - 1) {
      pages.push("...");
    }
    
    // Always add last page if there are multiple pages
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pages = getPageNumbers();
  
  // Handle page navigation with button clicks, with debounce to prevent multiple rapid clicks
  const handlePageClick = (page: number) => {
    // Prevent unnecessary state updates
    if (page === internalPage || page < 1 || page > totalPages) return;
    
    // Clear any pending timeouts
    if (pageChangeTimeoutRef.current) {
      clearTimeout(pageChangeTimeoutRef.current);
    }
    
    // Update internal state immediately for responsive UI
    setInternalPage(page);
    lastPageRef.current = page;
    
    // Debounce the actual parent callback to prevent multiple rapid changes
    pageChangeTimeoutRef.current = setTimeout(() => {
      console.log(`Pagination: switching to page ${page}`);
      onPageChange(page);
      pageChangeTimeoutRef.current = null;
    }, 50);
  };
  
  // Handle previous/next buttons
  const handlePrevious = () => {
    if (internalPage > 1) {
      handlePageClick(internalPage - 1);
    }
  };
  
  const handleNext = () => {
    if (internalPage < totalPages) {
      handlePageClick(internalPage + 1);
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (pageChangeTimeoutRef.current) {
        clearTimeout(pageChangeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        disabled={internalPage <= 1}
        type="button"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">{previousLabel}</span>
      </Button>
      
      {pages.map((page, i) => {
        if (page === "...") {
          return (
            <Button key={`ellipsis-${i}`} variant="outline" size="icon" disabled type="button">
              ...
            </Button>
          );
        }
        
        const pageNum = page as number;
        return (
          <Button
            key={pageNum}
            variant={pageNum === internalPage ? "default" : "outline"}
            onClick={() => handlePageClick(pageNum)}
            className="hidden sm:inline-flex"
            type="button"
          >
            {pageNum}
          </Button>
        );
      })}
      
      <div className="flex items-center text-sm sm:hidden">
        {pageLabel(internalPage)}
      </div>
      
      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        disabled={internalPage >= totalPages}
        type="button"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">{nextLabel}</span>
      </Button>
    </div>
  );
}

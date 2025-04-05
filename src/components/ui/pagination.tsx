
import React from "react";
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
  // Göstəriləcək səhifə nömrələrini müəyyən et
  const getPageNumbers = () => {
    const delta = 1; // Cari səhifənin hər iki tərəfindən göstəriləcək səhifə sayı
    const pages = [];
    
    // Əvvəldən əlavə ediləcək səhifələr
    for (let i = Math.max(2, currentPage - delta); i < currentPage; i++) {
      pages.push(i);
    }
    
    // Cari səhifə
    if (currentPage > 1 && currentPage < totalPages) {
      pages.push(currentPage);
    }
    
    // Sondan əlavə ediləcək səhifələr
    for (let i = currentPage + 1; i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      pages.push(i);
    }
    
    // Əvvəldə boşluq
    if (pages[0] > 2) {
      pages.unshift("...");
    }
    
    // İlk səhifə
    if (totalPages > 1) {
      pages.unshift(1);
    }
    
    // Sonda boşluq
    if (pages[pages.length - 1] < totalPages - 1) {
      pages.push("...");
    }
    
    // Son səhifə
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">{previousLabel}</span>
      </Button>
      
      {pages.map((page, i) => {
        if (page === "...") {
          return (
            <Button key={`ellipsis-${i}`} variant="outline" size="icon" disabled>
              ...
            </Button>
          );
        }
        
        const pageNum = page as number;
        return (
          <Button
            key={pageNum}
            variant={pageNum === currentPage ? "default" : "outline"}
            onClick={() => onPageChange(pageNum)}
            className="hidden sm:inline-flex"
          >
            {pageNum}
          </Button>
        );
      })}
      
      <div className="flex items-center text-sm sm:hidden">
        {pageLabel(currentPage)}
      </div>
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">{nextLabel}</span>
      </Button>
    </div>
  );
}

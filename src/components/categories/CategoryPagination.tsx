
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useLanguage } from '@/context/LanguageContext';

interface CategoryPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const CategoryPagination: React.FC<CategoryPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const { t } = useLanguage();

  // Səhifə düymələrini yaratmaq üçün köməkçi funksiya
  const getPageNumbers = () => {
    const pages = [];
    
    // Əgər cəmi 7-dən az səhifə varsa, hamısını göstər
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }
    
    // Əvvəldən ilk 3 səhifə
    if (currentPage <= 3) {
      return [1, 2, 3, 4, '...', totalPages];
    }
    
    // Son 3 səhifədəyiksə
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    
    // Ortadayıqsa, cari səhifəni ortada göstər
    return [
      1, 
      '...', 
      currentPage - 1, 
      currentPage, 
      currentPage + 1, 
      '...', 
      totalPages
    ];
  };

  const pageNumbers = getPageNumbers();
  
  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
            className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
        
        {pageNumbers.map((pageNumber, index) => (
          <PaginationItem key={index}>
            {pageNumber === '...' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(pageNumber as number);
                }}
                isActive={pageNumber === currentPage}
              >
                {pageNumber}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default CategoryPagination;

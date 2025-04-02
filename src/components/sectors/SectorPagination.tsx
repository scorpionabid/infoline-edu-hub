
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface SectorPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

const SectorPagination: React.FC<SectorPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  const { t } = useLanguage();

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    // Always show first page
    pages.push(1);
    
    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(currentPage + 1, totalPages - 1); i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }
    
    // Sort and add ellipses
    return pages.sort((a, b) => a - b).map((page, index, array) => {
      // Add ellipses where there are gaps in the sequence
      if (index > 0 && page - array[index - 1] > 1) {
        return (
          <React.Fragment key={`ellipsis-${page}`}>
            <div className="px-2">...</div>
            <Button
              variant={page === currentPage ? "default" : "outline"}
              className="h-8 w-8"
              onClick={() => goToPage(page)}
            >
              {page}
            </Button>
          </React.Fragment>
        );
      }
      
      return (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          className="h-8 w-8"
          onClick={() => goToPage(page)}
        >
          {page}
        </Button>
      );
    });
  };

  return (
    <div className="flex items-center justify-between px-2">
      <div className="text-sm text-gray-500">
        {totalItems !== undefined && pageSize 
          ? `${t('showing')} ${Math.min((currentPage - 1) * (pageSize || 10) + 1, totalItems)} - ${Math.min(currentPage * (pageSize || 10), totalItems)} ${t('of')} ${totalItems}`
          : `${t('page')} ${currentPage} ${t('of')} ${totalPages}`}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">{t('previous')}</span>
        </Button>
        <div className="flex items-center space-x-2">
          {getPageNumbers()}
        </div>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">{t('next')}</span>
        </Button>
      </div>
    </div>
  );
};

export default SectorPagination;

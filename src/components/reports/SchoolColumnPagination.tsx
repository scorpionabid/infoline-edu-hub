import React from 'react';
import { Button } from "@/components/ui/button";

interface SchoolColumnPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const SchoolColumnPagination: React.FC<SchoolColumnPaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange
}) => {
  if (totalItems <= pageSize) return null;

  return (
    <div className="flex justify-center items-center pt-4 space-x-2">
      <Button 
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        Əvvəlki
      </Button>
      
      <div className="flex items-center space-x-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(page => {
            return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2;
          })
          .map((page, index, array) => {
            const showEllipsis = index > 0 && array[index - 1] !== page - 1;
            return (
              <React.Fragment key={page}>
                {showEllipsis && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              </React.Fragment>
            );
          })
        }
      </div>
      
      <Button 
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        Növbəti
      </Button>
    </div>
  );
};

export default SchoolColumnPagination;

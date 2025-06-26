
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  previousLabel?: string;
  nextLabel?: string;
  pageLabel?: (page: number) => string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  previousLabel = 'Əvvəlki',
  nextLabel = 'Növbəti',
  pageLabel = (page) => `Səhifə ${page} / ${totalPages}`
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
        {previousLabel}
      </Button>
      
      <span className="text-sm text-muted-foreground">
        {pageLabel(currentPage)}
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        {nextLabel}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

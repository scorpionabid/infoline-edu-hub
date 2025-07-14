import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PaginationState, PaginationActions } from '@/hooks/reports/usePaginatedReports';

export interface PaginationControlsProps {
  pagination: PaginationState;
  actions: PaginationActions;
  showPageSizeSelector?: boolean;
  showPageInfo?: boolean;
  showJumpToPage?: boolean;
  className?: string;
  compact?: boolean;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 200];

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  pagination,
  actions,
  showPageSizeSelector = true,
  showPageInfo = true,
  showJumpToPage = false,
  className = '',
  compact = false
}) => {
  const {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    isLoading = false
  } = pagination;

  const {
    goToPage,
    nextPage,
    previousPage,
    setPageSize = () => {}
  } = actions;

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const delta = compact ? 1 : 2;
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Complex pagination logic
      pages.push(1);
      
      if (currentPage > delta + 2) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - delta);
      const end = Math.min(totalPages - 1, currentPage + delta);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - delta - 1) {
        pages.push('...');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();
  
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className={cn(
      'flex items-center justify-between space-x-4 py-4',
      compact && 'py-2',
      className
    )}>
      {/* Left side - Page info and page size selector */}
      <div className="flex items-center space-x-4">
        {showPageInfo && (
          <div className="text-sm text-muted-foreground">
            Gosterilir: {startItem}-{endItem} / {totalItems}
          </div>
        )}
        
        {showPageSizeSelector && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Sehife olcusu:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => setPageSize(parseInt(value))}
              disabled={isLoading}
            >
              <SelectTrigger className="w-16 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Right side - Pagination controls */}
      <div className="flex items-center space-x-1">
        {/* First page button */}
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={() => goToPage(1)}
          disabled={!hasPreviousPage || isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        {/* Previous page button */}
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={previousPage}
          disabled={!hasPreviousPage || isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page number buttons */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span 
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-muted-foreground"
                >
                  ...
                </span>
              );
            }
            
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size={compact ? "sm" : "default"}
                onClick={() => goToPage(page as number)}
                disabled={isLoading}
                className={cn(
                  "h-8 w-8 p-0",
                  currentPage === page && "bg-primary text-primary-foreground"
                )}
              >
                {page}
              </Button>
            );
          })}
        </div>

        {/* Next page button */}
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={nextPage}
          disabled={!hasNextPage || isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        {/* Last page button */}
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={() => goToPage(totalPages)}
          disabled={!hasNextPage || isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center ml-2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Infinite scroll trigger component
 */
export interface InfiniteScrollTriggerProps {
  onLoadMore: () => void;
  hasNextPage: boolean;
  isLoading: boolean;
  className?: string;
}

export const InfiniteScrollTrigger: React.FC<InfiniteScrollTriggerProps> = ({
  onLoadMore,
  hasNextPage,
  isLoading,
  className = ''
}) => {
  React.useEffect(() => {
    const handleScroll = () => {
      if (
        hasNextPage &&
        !isLoading &&
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000 // 1000px before bottom
      ) {
        onLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isLoading, onLoadMore]);

  if (!hasNextPage) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        Butun melumatlar yuklendi
      </div>
    );
  }

  return (
    <div className={cn('text-center py-8', className)}>
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Daha cox melumat yuklenir...</span>
        </div>
      ) : (
        <Button 
          variant="outline" 
          onClick={onLoadMore}
          className=""
        >
          Daha cox yukle
        </Button>
      )}
    </div>
  );
};

/**
 * Combined pagination component with both regular and infinite scroll support
 */
export interface SmartPaginationProps {
  pagination: PaginationState;
  actions: PaginationActions;
  mode?: 'pagination' | 'infinite' | 'auto';
  className?: string;
  compact?: boolean;
}

export const SmartPagination: React.FC<SmartPaginationProps> = ({
  pagination,
  actions,
  mode = 'auto',
  className = '',
  compact = false
}) => {
  const { totalItems } = pagination;
  const { loadMore } = actions;

  // Auto mode: use infinite scroll for mobile, pagination for desktop
  const effectiveMode = mode === 'auto' 
    ? (window.innerWidth < 768 ? 'infinite' : 'pagination')
    : mode;

  if (effectiveMode === 'infinite') {
    return (
      <InfiniteScrollTrigger
        onLoadMore={loadMore}
        hasNextPage={pagination.hasNextPage}
        isLoading={pagination.isLoadingMore}
        className={className}
      />
    );
  }

  return (
    <PaginationControls
      pagination={pagination}
      actions={actions}
      className={className}
      compact={compact}
    />
  );
};

export default PaginationControls;

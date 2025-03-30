
import React from 'react';
import { Button } from '@/components/ui/button';

interface RegionPaginationProps {
  t: (key: string) => string;
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
}

const RegionPagination: React.FC<RegionPaginationProps> = ({
  t,
  currentPage,
  totalPages,
  handlePageChange,
}) => (
  <div className="flex justify-center mt-4">
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        {t('previous')}
      </Button>
      <div className="flex items-center space-x-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Button>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        {t('next')}
      </Button>
    </div>
  </div>
);

export default RegionPagination;

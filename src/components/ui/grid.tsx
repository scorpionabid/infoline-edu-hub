
import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps {
  children: React.ReactNode;
  columns: number;
  className?: string;
}

export const Grid: React.FC<GridProps> = ({ children, columns = 1, className }) => {
  const getGridCols = () => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1';
    }
  };

  return (
    <div className={cn('grid gap-4', getGridCols(), className)}>
      {children}
    </div>
  );
};

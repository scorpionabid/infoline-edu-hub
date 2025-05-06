
import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: number;
  gap?: number;
}

export const Grid: React.FC<GridProps> = ({ 
  children, 
  className, 
  cols = 3,
  gap = 4
}) => {
  return (
    <div 
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Grid;

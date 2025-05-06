
import React from 'react';
import { cn } from '@/lib/utils';

export interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: number | {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
}

export const Grid: React.FC<GridProps> = ({ 
  children, 
  className, 
  cols = 3,
  gap = 4
}) => {
  // Responsive cols obyekti üçün yoxlama
  if (typeof cols === 'object') {
    const { default: defaultCols, sm = defaultCols, md = sm, lg = md, xl = lg } = cols;
    
    return (
      <div 
        className={cn(
          `grid grid-cols-${defaultCols} sm:grid-cols-${sm} md:grid-cols-${md} lg:grid-cols-${lg} xl:grid-cols-${xl} gap-${gap}`,
          className
        )}
      >
        {children}
      </div>
    );
  }
  
  // Sadə nömrə üçün default təyinat
  return (
    <div 
      className={cn(
        `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-${cols} gap-${gap}`,
        className
      )}
    >
      {children}
    </div>
  );
};

export default Grid;

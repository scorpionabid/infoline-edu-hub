
import React from 'react';
import { cn } from '@/lib/utils';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: number | { default: number; sm?: number; md?: number; lg?: number };
  columns?: number | { default: number; sm?: number; md?: number; lg?: number }; // Köhnə komponentlərlə uyğunluq üçün
  gap?: string;
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, children, cols = 1, columns, gap = "gap-4", ...props }, ref) => {
    // Həm cols həm də columns parametrlərini dəstəkləyək
    const columnValue = cols || columns || 1;
    
    // Dinamik grid-cols klassları əlavə edək
    const getColsClass = () => {
      if (typeof columnValue === 'number') {
        return `grid-cols-${columnValue}`;
      }

      // Responsive kolonlar üçün dizayn
      const { default: defaultCols, sm, md, lg } = columnValue;
      return cn(
        `grid-cols-${defaultCols}`,
        sm && `sm:grid-cols-${sm}`,
        md && `md:grid-cols-${md}`,
        lg && `lg:grid-cols-${lg}`
      );
    };

    return (
      <div
        className={cn("grid", gap, getColsClass(), className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = "Grid";

export { Grid };

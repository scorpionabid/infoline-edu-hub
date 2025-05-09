
import React from 'react';
import { cn } from "@/lib/utils";

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns: number;
  children: React.ReactNode;
}

export const Grid = ({ columns, children, className, ...props }: GridProps) => {
  const gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;

  return (
    <div 
      className={cn("grid gap-4", className)}
      style={{ gridTemplateColumns }}
      {...props}
    >
      {children}
    </div>
  );
};

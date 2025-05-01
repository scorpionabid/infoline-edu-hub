import React from 'react';
import { cn } from '@/lib/utils';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns: number;
  className?: string;
}

/**
 * Grid komponentini yaradırıq. Bu komponent columns parametri əsasında CSS grid layoutu yaradır və uşaq elementləri bu grid içərisində yerləşdirir.
 */
export function Grid({ 
  children, 
  columns, 
  className, 
  ...props 
}: GridProps) {
  // Calculate the grid template columns based on the number of columns
  const gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;

  return (
    <div 
      className={cn(
        'grid w-full', 
        className
      )}
      style={{ gridTemplateColumns }}
      {...props}
    >
      {children}
    </div>
  );
}
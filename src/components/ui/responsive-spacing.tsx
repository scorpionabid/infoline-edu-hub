
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveSpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const ResponsiveSpacer: React.FC<ResponsiveSpacerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizes = {
    xs: 'h-2 sm:h-3',
    sm: 'h-3 sm:h-4', 
    md: 'h-4 sm:h-6',
    lg: 'h-6 sm:h-8',
    xl: 'h-8 sm:h-12'
  };

  return <div className={cn(sizes[size], className)} />;
};

interface ResponsiveContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  size = 'lg',
  className 
}) => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-none'
  };

  return (
    <div className={cn(
      'mx-auto px-3 sm:px-4 lg:px-6',
      sizes[size],
      className
    )}>
      {children}
    </div>
  );
};

export { ResponsiveSpacer, ResponsiveContainer };

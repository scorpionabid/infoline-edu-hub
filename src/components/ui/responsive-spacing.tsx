
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveSpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ResponsiveSpacer: React.FC<ResponsiveSpacerProps> = ({
  size = 'md',
  className
}) => {
  const sizeClasses = {
    xs: 'h-2 md:h-3',
    sm: 'h-3 md:h-4',
    md: 'h-4 md:h-6',
    lg: 'h-6 md:h-8',
    xl: 'h-8 md:h-12'
  };

  return <div className={cn(sizeClasses[size], className)} />;
};

export default ResponsiveSpacer;

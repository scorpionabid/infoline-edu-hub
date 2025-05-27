
import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  className?: string;
  children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({ 
  variant = 'p', 
  className, 
  children 
}) => {
  const Component = variant;
  
  const variantClasses = {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-semibold',
    h3: 'text-xl font-medium',
    h4: 'text-lg font-medium',
    h5: 'text-base font-medium',
    h6: 'text-sm font-medium',
    p: 'text-base',
    span: 'text-base'
  };

  return (
    <Component className={cn(variantClasses[variant], className)}>
      {children}
    </Component>
  );
};

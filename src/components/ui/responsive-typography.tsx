
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveTypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'small';
  className?: string;
}

export const ResponsiveTypography: React.FC<ResponsiveTypographyProps> = ({
  children,
  variant = 'p',
  className
}) => {
  const baseClasses = {
    h1: 'text-2xl md:text-3xl lg:text-4xl font-bold',
    h2: 'text-xl md:text-2xl lg:text-3xl font-semibold',
    h3: 'text-lg md:text-xl lg:text-2xl font-medium',
    h4: 'text-base md:text-lg lg:text-xl font-medium',
    p: 'text-sm md:text-base',
    small: 'text-xs md:text-sm'
  };

  const Tag = variant as keyof JSX.IntrinsicElements;

  return (
    <Tag className={cn(baseClasses[variant], className)}>
      {children}
    </Tag>
  );
};

export default ResponsiveTypography;

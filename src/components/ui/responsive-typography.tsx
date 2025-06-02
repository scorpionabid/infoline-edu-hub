
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveHeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}

const ResponsiveHeading: React.FC<ResponsiveHeadingProps> = ({ 
  level, 
  children, 
  className 
}) => {
  const baseClasses = "font-semibold text-foreground";
  
  const sizeClasses = {
    1: "text-xl sm:text-2xl lg:text-3xl",
    2: "text-lg sm:text-xl lg:text-2xl", 
    3: "text-base sm:text-lg lg:text-xl",
    4: "text-sm sm:text-base lg:text-lg",
    5: "text-sm lg:text-base",
    6: "text-xs sm:text-sm"
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag className={cn(baseClasses, sizeClasses[level], className)}>
      {children}
    </Tag>
  );
};

interface ResponsiveTextProps {
  variant?: 'body' | 'small' | 'large' | 'muted';
  children: React.ReactNode;
  className?: string;
}

const ResponsiveText: React.FC<ResponsiveTextProps> = ({ 
  variant = 'body', 
  children, 
  className 
}) => {
  const variants = {
    body: "text-sm sm:text-base",
    small: "text-xs sm:text-sm",
    large: "text-base sm:text-lg",
    muted: "text-xs sm:text-sm text-muted-foreground"
  };

  return (
    <p className={cn(variants[variant], className)}>
      {children}
    </p>
  );
};

export { ResponsiveHeading, ResponsiveText };

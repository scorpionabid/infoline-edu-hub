
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { EnhancedCard } from '@/types/enhanced-design';

export interface EnhancedCardProps extends EnhancedCard {
  title?: string;
  description?: string;
  content?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const getCardVariantClasses = (variant: EnhancedCard['variant'] = 'default') => {
  const variants = {
    default: 'bg-card border border-border',
    elevated: 'bg-card border-0 shadow-lg hover:shadow-xl transition-shadow duration-300',
    outlined: 'bg-transparent border-2 border-primary/20 hover:border-primary/40 transition-colors',
    glass: 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 shadow-lg',
    gradient: 'bg-gradient-to-br from-primary/5 via-transparent to-accent/5 border border-primary/10 hover:from-primary/10 hover:to-accent/10 transition-all duration-300'
  };
  return variants[variant];
};

const getSizeClasses = (size: EnhancedCard['size'] = 'md') => {
  const sizes = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };
  return sizes[size];
};

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ 
    title, 
    description, 
    content, 
    children, 
    variant = 'default',
    size = 'md',
    hover = false,
    interactive = false,
    className,
    onClick,
    ...props 
  }, ref) => {
    const isClickable = onClick || interactive;
    
    return (
      <Card 
        ref={ref}
        className={cn(
          getCardVariantClasses(variant),
          getSizeClasses(size),
          hover && "hover:shadow-md transition-shadow duration-200",
          isClickable && "cursor-pointer hover:scale-[1.02] transition-transform duration-200",
          "rounded-xl overflow-hidden",
          className
        )}
        onClick={onClick}
        {...props}
      >
        {(title || description) && (
          <CardHeader className="pb-3">
            {title && (
              <CardTitle className="text-lg font-semibold text-foreground">
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-sm text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </CardHeader>
        )}
        {(content || children) && (
          <CardContent className="pt-0">
            {content || children}
          </CardContent>
        )}
      </Card>
    );
  }
);

EnhancedCard.displayName = "EnhancedCard";

export default EnhancedCard;

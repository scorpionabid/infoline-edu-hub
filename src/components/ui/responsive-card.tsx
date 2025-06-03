
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ResponsiveCardProps {
  title?: string;
  description?: string;
  content?: React.ReactNode;
  variant?: 'default' | 'compact';
  children?: React.ReactNode;
}

export const ResponsiveCard = React.forwardRef<HTMLDivElement, ResponsiveCardProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ title, description, content, variant = 'default', children, className, ...props }, ref) => {
    return (
      <Card 
        ref={ref}
        className={cn(
          "transition-all duration-200",
          variant === 'compact' && "p-3 sm:p-4",
          variant === 'default' && "p-4 sm:p-6",
          className
        )}
        {...props}
      >
        {(title || description) && (
          <CardHeader className={cn(
            variant === 'compact' ? "pb-2" : "pb-4"
          )}>
            {title && (
              <CardTitle className={cn(
                variant === 'compact' ? "text-sm sm:text-base" : "text-base sm:text-lg"
              )}>
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-xs sm:text-sm">
                {description}
              </CardDescription>
            )}
          </CardHeader>
        )}
        {(content || children) && (
          <CardContent className={cn(
            variant === 'compact' ? "pt-0 px-0 pb-0" : "pt-0"
          )}>
            {content || children}
          </CardContent>
        )}
      </Card>
    );
  }
);

ResponsiveCard.displayName = "ResponsiveCard";

export default ResponsiveCard;

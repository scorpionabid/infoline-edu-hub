
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EnhancedCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  title,
  description,
  children,
  className,
  variant = 'default',
  size = 'md'
}) => {
  const cardClasses = cn(
    'transition-all duration-200',
    {
      'shadow-sm hover:shadow-md': variant === 'default',
      'border-2': variant === 'outline',
      'bg-secondary/50': variant === 'secondary',
      'p-3': size === 'sm',
      'p-4': size === 'md',
      'p-6': size === 'lg',
    },
    className
  );

  return (
    <Card className={cardClasses}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default EnhancedCard;

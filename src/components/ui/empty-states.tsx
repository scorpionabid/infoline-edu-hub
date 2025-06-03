
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className
}) => (
  <Card className={cn('w-full', className)}>
    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </CardContent>
  </Card>
);

// Specific empty states
export const NoDataEmptyState: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => (
  <EmptyState
    title="Məlumat tapılmadı"
    description="Hələ ki, heç bir məlumat əlavə edilməyib."
    action={onRefresh ? { label: 'Yenilə', onClick: onRefresh } : undefined}
  />
);

export const NoResultsEmptyState: React.FC<{ onClearFilters?: () => void }> = ({ onClearFilters }) => (
  <EmptyState
    title="Nəticə tapılmadı"
    description="Axtarış kriteriyalarınıza uyğun nəticə yoxdur."
    action={onClearFilters ? { label: 'Filterləri təmizlə', onClick: onClearFilters } : undefined}
  />
);

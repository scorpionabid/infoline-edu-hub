
import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyLoadingWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  height?: string;
}

const LazyLoadingWrapper: React.FC<LazyLoadingWrapperProps> = ({ 
  children, 
  fallback, 
  height = "200px" 
}) => {
  const defaultFallback = (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-full" style={{ height }} />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

export default LazyLoadingWrapper;

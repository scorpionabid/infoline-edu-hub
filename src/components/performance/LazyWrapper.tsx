import React, { Suspense, lazy, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyWrapperProps {
  fallback?: React.ReactNode;
  height?: string;
  children?: React.ReactNode;
}

// Enhanced lazy loading wrapper with better performance
const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback, 
  height = "200px" 
}) => {
  const defaultFallback = (
    <div className="animate-pulse space-y-4 p-4">
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

// Higher-order component for lazy loading
export const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  fallbackHeight?: string
) => {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));
  
  return React.forwardRef<any, P>((props, ref) => (
    <LazyWrapper height={fallbackHeight}>
      <LazyComponent {...props} ref={ref} />
    </LazyWrapper>
  ));
};

// Performance-optimized loading indicator
export const LoadingIndicator: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
    </div>
  );
};

export default LazyWrapper;
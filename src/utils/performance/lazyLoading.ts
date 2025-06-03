
import { lazy, ComponentType } from 'react';

/**
 * Lazy load component with retry functionality
 */
export const lazyWithRetry = <T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  maxRetries: number = 3
) => {
  return lazy(async () => {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        return await componentImport();
      } catch (error) {
        retries++;
        
        if (retries === maxRetries) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, retries) * 1000)
        );
      }
    }
    
    throw new Error('Failed to load component after max retries');
  });
};

/**
 * Preload component for better performance
 */
export const preloadComponent = (
  componentImport: () => Promise<{ default: ComponentType<any> }>
) => {
  componentImport();
};

/**
 * Lazy load with preloading on hover/focus
 */
export const lazyWithPreload = <T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) => {
  const LazyComponent = lazy(componentImport);
  
  // Add preload method to component
  (LazyComponent as any).preload = () => componentImport();
  
  return LazyComponent;
};

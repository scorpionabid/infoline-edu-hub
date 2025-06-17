
import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { Loader2, Globe } from 'lucide-react';

interface TranslationWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minimal?: boolean;
  skipLoading?: boolean; // New: Skip loading state for critical UI
}

export const TranslationWrapper: React.FC<TranslationWrapperProps> = ({
  children,
  fallback,
  minimal = false,
  skipLoading = false
}) => {
  const { isLoading, isReady, error, language } = useTranslation();

  // CRITICAL FIX: Skip loading state for navigation/header
  if (skipLoading) {
    return <>{children}</>;
  }

  // Show loading state only when absolutely necessary
  if (isLoading && !isReady && !error) {
    if (fallback) return <>{fallback}</>;
    
    if (minimal) {
      return (
        <div className="flex items-center justify-center p-1">
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center min-h-[100px] animate-fade-in">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">
            {language === 'az' ? 'Yüklənir...' : 'Loading...'}
          </span>
        </div>
      </div>
    );
  }

  // Show error state with recovery option (minimal)
  if (error && !isReady) {
    if (minimal) {
      return (
        <div className="flex items-center justify-center p-1">
          <Globe className="h-3 w-3 text-muted-foreground" />
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center min-h-[100px]">
        <div className="text-center space-y-2">
          <Globe className="h-8 w-8 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {language === 'az' ? 'Dil yüklənərkən xəta' : 'Translation loading error'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="text-xs text-primary hover:text-primary/80 transition-colors"
          >
            {language === 'az' ? 'Yenilə' : 'Refresh'}
          </button>
        </div>
      </div>
    );
  }

  // Translations are ready or loading with cached data, render children
  return <>{children}</>;
};

export default TranslationWrapper;

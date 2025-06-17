
import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { Loader2 } from 'lucide-react';

interface TranslationWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minimal?: boolean;
}

export const TranslationWrapper: React.FC<TranslationWrapperProps> = ({
  children,
  fallback,
  minimal = false
}) => {
  const { isLoading, isReady, error } = useTranslation();

  // Show loading state
  if (isLoading && !isReady) {
    if (fallback) return <>{fallback}</>;
    
    if (minimal) {
      return (
        <div className="flex items-center justify-center p-2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm text-muted-foreground">Dil yüklənir...</span>
        </div>
      </div>
    );
  }

  // Show error state with recovery option
  if (error && !isReady) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center space-y-2">
          <p className="text-sm text-red-600">Tərcümələr yüklənmədi</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Səhifəni yenilə
          </button>
        </div>
      </div>
    );
  }

  // Translations are ready, render children
  return <>{children}</>;
};

export default TranslationWrapper;

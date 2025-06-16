/**
 * Legacy Compatibility Layer for LanguageContext
 * 
 * Bu fayl köhnə import-ları saxlamaq üçün yaradılmışdır.
 * Yeni kod yazmaq üçün @/contexts/TranslationContext istifadə edin.
 * 
 * @deprecated Use @/contexts/TranslationContext instead
 */

import React from 'react';
import { 
  useTranslation as useBaseTranslation, 
  TranslationProvider as BaseTranslationProvider 
} from '@/contexts/TranslationContext';
import { useSmartTranslation } from '@/hooks/translation/useSmartTranslation';
import type { SupportedLanguage } from '@/types/translation';

// Legacy context export for backward compatibility
export const LanguageContext = React.createContext<any>(null);

/**
 * Legacy LanguageProvider - wraps the new TranslationProvider
 * @deprecated Use TranslationProvider from @/contexts/TranslationContext
 */
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BaseTranslationProvider>
      {children}
    </BaseTranslationProvider>
  );
};

/**
 * Legacy useLanguage hook for backward compatibility
 * @deprecated Use useTranslation from @/contexts/TranslationContext
 */
export const useLanguage = () => {
  const { t, language, setLanguage, isLoading, error } = useBaseTranslation();
  
  return {
    t,
    language,
    setLanguage,
    isLoading,
    error,
    // Legacy aliases
    currentLanguage: language,
    changeLanguage: setLanguage,
  };
};

/**
 * Safe translation hook with automatic fallback and error handling
 * This provides enhanced safety for translation calls
 */
export const useLanguageSafe = () => {
  const { 
    t: baseT, 
    tSafe, 
    tContext, 
    language, 
    setLanguage, 
    isLoading, 
    error 
  } = useSmartTranslation();

  // Safe translation function that never throws and always returns a string
  const t = (key: string, params?: Record<string, any>): string => {
    try {
      if (!key) {
        console.warn('Translation key is empty or undefined');
        return '';
      }

      // Use tSafe which has built-in fallback logic
      const result = tSafe(key, undefined, {
        interpolation: params,
        warnMissing: process.env.NODE_ENV === 'development'
      });

      return result || key.split('.').pop() || key;
    } catch (error) {
      console.error('Translation error for key:', key, error);
      // Return a readable fallback from the key
      return key.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || key;
    }
  };

  // Context-aware translation with enhanced error handling
  const tWithContext = (key: string, context: Record<string, any>): string => {
    try {
      return tContext(key, context);
    } catch (error) {
      console.error('Context translation error:', error);
      return t(key, context);
    }
  };

  // Validation-specific translation helper
  const tValidation = (field: string, rule: string, params?: Record<string, any>): string => {
    const key = `validation.${rule}`;
    return tWithContext(key, { field, ...params });
  };

  // Component-specific translation helper
  const tComponent = (component: string, key: string, defaultValue?: string): string => {
    const componentKey = `components.${component}.${key}`;
    const result = tSafe(componentKey, null, { warnMissing: false });
    
    if (result && result !== componentKey) {
      return result;
    }
    
    // Try UI namespace as fallback
    const uiKey = `ui.${key}`;
    const uiResult = tSafe(uiKey, null, { warnMissing: false });
    
    if (uiResult && uiResult !== uiKey) {
      return uiResult;
    }
    
    // Return default value or processed key
    return defaultValue || key.replace(/([A-Z])/g, ' $1').trim();
  };

  return {
    t,
    tSafe,
    tContext: tWithContext,
    tValidation,
    tComponent,
    language,
    setLanguage,
    isLoading,
    error,
    // Legacy compatibility properties
    currentLanguage: language,
    changeLanguage: setLanguage,
    isReady: !isLoading && !error,
  };
};

/**
 * Optimized translation hook for performance-critical components
 * Uses memoization and smart caching
 */
export const useOptimizedTranslation = () => {
  const {
    t: baseT,
    tSafe,
    language,
    setLanguage,
    isLoading,
    error
  } = useSmartTranslation();

  // Memoized translation function for better performance
  const t = React.useCallback((key: string, params?: Record<string, any>): string => {
    if (!key) return '';
    
    try {
      return tSafe(key, undefined, {
        interpolation: params,
        warnMissing: false // Suppress warnings in optimized mode
      });
    } catch (error) {
      console.error('Optimized translation error:', error);
      return key.split('.').pop() || key;
    }
  }, [tSafe]);

  // Batch translation function for multiple keys
  const tBatch = React.useCallback((keys: string[], params?: Record<string, any>) => {
    return keys.reduce((acc, key) => {
      acc[key] = t(key, params);
      return acc;
    }, {} as Record<string, string>);
  }, [t]);

  // Namespace-specific translation helper
  const tNamespace = React.useCallback((namespace: string) => {
    return (key: string, params?: Record<string, any>) => {
      return t(`${namespace}.${key}`, params);
    };
  }, [t]);

  return {
    t,
    tBatch,
    tNamespace,
    language,
    setLanguage,
    isLoading,
    error,
    // Performance metrics (for development)
    ...(process.env.NODE_ENV === 'development' && {
      _performance: {
        language,
        isLoading,
        error: !!error
      }
    })
  };
};

// Default export for legacy compatibility
export default {
  LanguageContext,
  LanguageProvider,
  useLanguage,
  useLanguageSafe,
  useOptimizedTranslation,
};

import { useCallback } from 'react';
import { useTranslation as useBaseTranslation } from '@/contexts/TranslationContext';
import type { 
  SmartTranslationOptions, 
  TranslationInterpolationOptions 
} from '@/types/translation';

/**
 * Smart Translation Hook - İyileşdirilmiş translation hook
 * 
 * Features:
 * - Avtomatik fallback
 * - Context-aware translation
 * - Missing key detection və logging
 * - Type safety
 * - Performance optimization
 */
export const useSmartTranslation = () => {
  const { t: baseT, language, setLanguage, isLoading, error } = useBaseTranslation();

  /**
   * Safe translation function with automatic fallback
   */
  const tSafe = useCallback((
    key: string, 
    fallback?: string,
    options?: SmartTranslationOptions
  ): string => {
    try {
      const translation = baseT(key, options?.interpolation);
      
      // Check if translation is missing (returns [key] format)
      if (translation.startsWith('[') && translation.endsWith(']')) {
        // Log missing translation in development
        if (process.env.NODE_ENV === 'development' && options?.warnMissing !== false) {
          console.warn(`🔍 Translation missing: ${key} for language: ${language}`);
        }
        
        // Return fallback or generate one from key
        const finalFallback = fallback || 
                             options?.defaultValue || 
                             generateFallbackFromKey(key);
        return finalFallback;
      }
      
      return translation;
    } catch (err) {
      console.error('Translation error:', err);
      return fallback || key.split('.').pop() || key;
    }
  }, [baseT, language]);

  /**
   * Context-aware translation with enhanced interpolation
   */
  const tContext = useCallback((
    key: string, 
    context: Record<string, any>,
    options?: SmartTranslationOptions
  ): string => {
    try {
      // Merge context with interpolation options
      const interpolationOptions: TranslationInterpolationOptions = {
        ...options?.interpolation,
        ...context
      };
      
      const translation = baseT(key, interpolationOptions);
      
      // Apply context-specific formatting
      if (options?.context) {
        return applyContextFormatting(translation, options.context, context);
      }
      
      return translation;
    } catch (err) {
      console.error('Context translation error:', err);
      return options?.defaultValue || key;
    }
  }, [baseT]);

  /**
   * Module-specific translation with automatic prefixing
   */
  const tModule = useCallback((
    module: string,
    key: string,
    options?: SmartTranslationOptions
  ): string => {
    const fullKey = `${module}.${key}`;
    return tSafe(fullKey, options?.defaultValue, options);
  }, [tSafe]);

  /**
   * Plural-aware translation
   */
  const tPlural = useCallback((
    key: string,
    count: number,
    options?: SmartTranslationOptions
  ): string => {
    const pluralKey = count === 1 ? `${key}.singular` : `${key}.plural`;
    const translation = tSafe(pluralKey, undefined, options);
    
    // If plural form not found, try the base key
    if (translation === pluralKey) {
      return tSafe(key, options?.defaultValue, {
        ...options,
        interpolation: { ...options?.interpolation, count }
      });
    }
    
    return translation.replace('{{count}}', count.toString());
  }, [tSafe]);

  /**
   * Date-aware translation
   */
  const tDate = useCallback((
    key: string,
    date: Date,
    options?: SmartTranslationOptions
  ): string => {
    const dateFormat = new Intl.DateTimeFormat(getLanguageLocale(language));
    const formattedDate = dateFormat.format(date);
    
    return tContext(key, { date: formattedDate }, options);
  }, [tContext, language]);

  /**
   * Number-aware translation with localization
   */
  const tNumber = useCallback((
    key: string,
    number: number,
    options?: SmartTranslationOptions
  ): string => {
    const numberFormat = new Intl.NumberFormat(getLanguageLocale(language));
    const formattedNumber = numberFormat.format(number);
    
    return tContext(key, { number: formattedNumber, count: number }, options);
  }, [tContext, language]);

  /**
   * Validation-aware translation for forms
   */
  const tValidation = useCallback((
    field: string,
    rule: string,
    params?: Record<string, any>
  ): string => {
    const key = `validation.${rule}`;
    return tContext(key, { field, ...params });
  }, [tContext]);

  /**
   * Component-specific translation helper
   */
  const tComponent = useCallback((
    component: string,
    key: string,
    options?: SmartTranslationOptions
  ): string => {
    // Try component-specific key first
    const componentKey = `components.${component}.${key}`;
    const componentTranslation = tSafe(componentKey, null, { warnMissing: false });
    
    if (componentTranslation !== componentKey) {
      return componentTranslation;
    }
    
    // Fallback to general UI key
    const uiKey = `ui.${key}`;
    const uiTranslation = tSafe(uiKey, null, { warnMissing: false });
    
    if (uiTranslation !== uiKey) {
      return uiTranslation;
    }
    
    // Fallback to core
    return tSafe(`core.${key}`, options?.defaultValue || key, options);
  }, [tSafe]);

  return {
    // Base functions
    t: baseT,
    tSafe,
    tContext,
    
    // Enhanced functions
    tModule,
    tPlural,
    tDate,
    tNumber,
    tValidation,
    tComponent,
    
    // State
    language,
    setLanguage,
    isLoading,
    error,
    
    // Utilities
    isTranslationMissing: (key: string) => {
      const translation = baseT(key);
      return translation.startsWith('[') && translation.endsWith(']');
    },
    
    // Preload translations for performance
    preloadModule: async (module: string) => {
      // This would preload a specific module's translations
      console.log(`Preloading translations for module: ${module}`);
    }
  };
};

/**
 * Helper functions
 */
function generateFallbackFromKey(key: string): string {
  return key
    .split('.')
    .pop()
    ?.replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim() || key;
}

function getLanguageLocale(language: string): string {
  const localeMap: Record<string, string> = {
    'az': 'az-AZ',
    'en': 'en-US',
    'ru': 'ru-RU',
    'tr': 'tr-TR'
  };
  return localeMap[language] || 'az-AZ';
}

function applyContextFormatting(
  translation: string, 
  context: string, 
  variables: Record<string, any>
): string {
  // Apply context-specific formatting rules
  switch (context) {
    case 'currency':
      return translation.replace(/{{(\w+)}}/g, (match, key) => {
        const value = variables[key];
        if (typeof value === 'number') {
          return new Intl.NumberFormat('az-AZ', { 
            style: 'currency', 
            currency: 'AZN' 
          }).format(value);
        }
        return match;
      });
      
    case 'percentage':
      return translation.replace(/{{(\w+)}}/g, (match, key) => {
        const value = variables[key];
        if (typeof value === 'number') {
          return `${value}%`;
        }
        return match;
      });
      
    default:
      return translation;
  }
}

export default useSmartTranslation;
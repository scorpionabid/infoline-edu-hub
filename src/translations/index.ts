
import type { 
  SupportedLanguage, 
  LanguageTranslations,
  TranslationModules as TranslationModulesType 
} from '../types/translation';
import { translationCache } from '@/services/translationCache';

// List of all available modules with type safety
const MODULE_NAMES = [
  'app',
  'auth',
  'categories',
  'columns',
  'core',
  'dashboard',
  'dataEntry',
  'dataManagement',
  'feedback',
  'general',
  'navigation',
  'notifications',
  'organization',
  'profile',
  'schools',
  'sectors',
  'settings',
  'statistics',
  'status',
  'theme',
  'time',
  'ui',
  'user',
  'userManagement',
  'validation',
  'approval'
] as const;

type ModuleName = typeof MODULE_NAMES[number];

// Enhanced loading with retry mechanism
const loadTranslations = async (
  lang: SupportedLanguage, 
  retryCount: number = 0
): Promise<LanguageTranslations> => {
  try {
    // Import all modules in parallel with better error handling
    const moduleImports = await Promise.allSettled(
      MODULE_NAMES.map(async (moduleName) => {
        try {
          const module = await import(`./${lang}/${moduleName}.ts`);
          return { [moduleName]: module.default || {} };
        } catch (error) {
          console.warn(`[i18n] Missing module '${moduleName}' for '${lang}', using empty fallback`);
          return { [moduleName]: {} };
        }
      })
    );

    // Process results
    const translations = moduleImports.reduce<Partial<LanguageTranslations>>((acc, result) => {
      if (result.status === 'fulfilled') {
        return { ...acc, ...result.value };
      }
      return acc;
    }, {});
    
    // Ensure all required modules are present with proper typing
    const completeTranslations: LanguageTranslations = {
      app: translations.app || {},
      auth: translations.auth || {},
      categories: translations.categories || {},
      columns: translations.columns || {},
      core: translations.core || {},
      dashboard: translations.dashboard || {},
      dataEntry: translations.dataEntry || {},
      dataManagement: translations.dataManagement || {},
      feedback: translations.feedback || {},
      general: translations.general || {},
      navigation: translations.navigation || {},
      notifications: translations.notifications || {},
      organization: translations.organization || {},
      profile: translations.profile || {},
      schools: translations.schools || {},
      sectors: translations.sectors || {},
      settings: translations.settings || {},
      statistics: translations.statistics || {},
      status: translations.status || {},
      theme: translations.theme || {},
      time: translations.time || {},
      ui: translations.ui || {},
      user: translations.user || {},
      userManagement: translations.userManagement || {},
      validation: translations.validation || {},
      approval: translations.approval || {}
    };

    // Cache the loaded translations
    translationCache.set(lang, completeTranslations);
    
    return completeTranslations;
  } catch (error) {
    console.error(`Failed to load translations for ${lang} (attempt ${retryCount + 1}):`, error);
    
    // Retry logic for network failures
    if (retryCount < 2) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return loadTranslations(lang, retryCount + 1);
    }
    
    throw error;
  }
};

/**
 * Get translations for a specific language with enhanced caching
 */
export const getTranslations = async (lang: SupportedLanguage): Promise<LanguageTranslations> => {
  // Try cache first
  const cached = translationCache.get(lang);
  if (cached) {
    return cached;
  }

  // Load from network
  return await loadTranslations(lang);
};

/**
 * Preload translations for a language in the background
 */
export const preloadTranslations = (lang: SupportedLanguage): void => {
  // Don't preload if already cached
  if (translationCache.has(lang)) {
    return;
  }

  loadTranslations(lang).catch(error => {
    console.error(`Failed to preload translations for ${lang}:`, error);
  });
};

/**
 * Clear the translation cache
 */
export const clearTranslationCache = (lang?: SupportedLanguage): void => {
  if (lang) {
    translationCache.delete(lang);
  } else {
    translationCache.clear();
  }
};

/**
 * Get cache information for debugging
 */
export const getCacheInfo = () => {
  return translationCache.getInfo();
};

// Re-export types for backward compatibility
export type { LanguageTranslations, SupportedLanguage };
export type TranslationModules = TranslationModulesType;

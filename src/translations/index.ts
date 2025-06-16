import type { 
  SupportedLanguage, 
  LanguageTranslations,
  TranslationModules as TranslationModulesType 
} from '../types/translation';

// Cache for loaded translations
const translationCache: Partial<Record<SupportedLanguage, LanguageTranslations>> = {};

// List of all available modules with type safety - YENİLƏNDİ
const MODULE_NAMES = [
  'app',
  'auth',
  'categories',
  'core',
  'dashboard',
  'dataEntry',
  'feedback',
  'general',
  'navigation',
  'notifications',
  'organization',
  'profile',
  'schools',
  'sectors',
  'status',
  'time',
  'ui',
  'user',
  'userManagement',
  'validation'
] as const;

type ModuleName = typeof MODULE_NAMES[number];

// Type guard to check if a string is a valid module name
const isModuleName = (name: string): name is ModuleName => {
  return (MODULE_NAMES as readonly string[]).includes(name);
};

/**
 * Load translations for a specific language
 * @param lang The language code to load translations for
 * @returns A promise that resolves to the loaded translations
 */
const loadTranslations = async (lang: SupportedLanguage): Promise<LanguageTranslations> => {
  // Return from cache if available
  if (translationCache[lang]) {
    return translationCache[lang]!;
  }

  try {
    // Import all modules in parallel with better error handling
    const moduleImports = await Promise.all(
      MODULE_NAMES.map(async (moduleName) => {
        try {
          // Skip validation module if it doesn't exist
          if (moduleName === 'validation' && lang !== 'en') {
            return { [moduleName]: {} };
          }
          
          // Try to import the module
          const module = await import(`./${lang}/${moduleName}.ts`);
          return { [moduleName]: module.default || {} };
        } catch (error) {
          // For non-critical modules, just return an empty object
          if (moduleName !== 'validation') {
            console.warn(`[i18n] Missing module '${moduleName}' for '${lang}', using empty fallback`);
          }
          return { [moduleName]: {} };
        }
      })
    );

    // Combine all modules into a single object with proper typing
    const translations = moduleImports.reduce<Partial<LanguageTranslations>>((acc, module) => {
      return { ...acc, ...module };
    }, {});
    
    // Ensure all required modules are present with proper typing
    const completeTranslations: LanguageTranslations = {
      app: translations.app || {},
      auth: translations.auth || {},
      categories: translations.categories || {},
      core: translations.core || {},
      dashboard: translations.dashboard || {},
      dataEntry: translations.dataEntry || {},
      feedback: translations.feedback || {},
      general: translations.general || {},
      navigation: translations.navigation || {},
      notifications: translations.notifications || {},
      organization: translations.organization || {},
      profile: translations.profile || {},
      schools: translations.schools || {},
      sectors: translations.sectors || {},
      status: translations.status || {},
      time: translations.time || {},
      ui: translations.ui || {},
      user: translations.user || {},
      userManagement: translations.userManagement || {},
      validation: translations.validation || {}
    };

    // Store in cache
    translationCache[lang] = completeTranslations;
    
    return completeTranslations;
  } catch (error) {
    console.error(`Failed to load translations for ${lang}:`, error);
    throw error;
  }
};

/**
 * Get translations for a specific language
 * @param lang The language code to get translations for
 * @returns A promise that resolves to the translations for the specified language
 */
export const getTranslations = async (lang: SupportedLanguage): Promise<LanguageTranslations> => {
  if (!translationCache[lang]) {
    translationCache[lang] = await loadTranslations(lang);
  }
  return translationCache[lang]!;
};

/**
 * Preload translations for a language in the background
 * @param lang The language code to preload
 */
export const preloadTranslations = (lang: SupportedLanguage): void => {
  if (!translationCache[lang]) {
    loadTranslations(lang).catch(error => {
      console.error(`Failed to preload translations for ${lang}:`, error);
    });
  }
};

/**
 * Clear the translation cache for a specific language or all languages
 * @param lang Optional language code to clear cache for (clears all if not provided)
 */
export const clearTranslationCache = (lang?: SupportedLanguage): void => {
  if (lang) {
    delete translationCache[lang];
  } else {
    Object.keys(translationCache).forEach(key => {
      delete translationCache[key as SupportedLanguage];
    });
  }
};

// Re-export types for backward compatibility
export type { LanguageTranslations, SupportedLanguage };

// Export the TranslationModules type from our types file
export type TranslationModules = TranslationModulesType;
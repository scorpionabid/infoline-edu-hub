
import { Language } from '@/types/language';
import translations from '@/translations';

/**
 * Enhanced translation utility with namespace support
 */
export class TranslationUtils {
  /**
   * Get translation with namespace support
   * @param key - Translation key (can include namespace like 'ui.save')
   * @param language - Target language
   * @param fallbackLanguage - Fallback language if translation not found
   * @returns Translated string
   */
  static getTranslation(
    key: string, 
    language: Language, 
    fallbackLanguage: Language = 'az'
  ): string {
    const keys = key.split('.');
    let translation: any = translations[language];
    
    // Navigate through nested keys
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        // Fallback to fallback language
        translation = translations[fallbackLanguage];
        for (const fk of keys) {
          if (translation && typeof translation === 'object' && fk in translation) {
            translation = translation[fk];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }
    
    return typeof translation === 'string' ? translation : key;
  }

  /**
   * Check if translation exists
   * @param key - Translation key
   * @param language - Target language
   * @returns Boolean indicating if translation exists
   */
  static hasTranslation(key: string, language: Language): boolean {
    const keys = key.split('.');
    let translation: any = translations[language];
    
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        return false;
      }
    }
    
    return typeof translation === 'string';
  }

  /**
   * Get all available languages
   * @returns Array of available language codes
   */
  static getAvailableLanguages(): Language[] {
    return Object.keys(translations) as Language[];
  }

  /**
   * Interpolate variables in translation strings
   * @param template - Translation template with variables like {name}
   * @param variables - Object with variable values
   * @returns Interpolated string
   */
  static interpolate(template: string, variables: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key]?.toString() || match;
    });
  }
}

/**
 * Enhanced translate function with interpolation
 * @param key - Translation key
 * @param language - Target language
 * @param variables - Variables for interpolation
 * @returns Translated and interpolated string
 */
export const translateWithVars = (
  key: string, 
  language: Language, 
  variables?: Record<string, string | number>
): string => {
  const translation = TranslationUtils.getTranslation(key, language);
  
  if (variables) {
    return TranslationUtils.interpolate(translation, variables);
  }
  
  return translation;
};

/**
 * Translation completeness checker
 */
export class TranslationChecker {
  /**
   * Check translation completeness across languages
   * @param baseLanguage - Base language to compare against
   * @returns Report of missing translations
   */
  static checkCompleteness(baseLanguage: Language = 'az') {
    const baseTranslations = translations[baseLanguage];
    const availableLanguages = TranslationUtils.getAvailableLanguages();
    const report: Record<string, string[]> = {};

    const flattenKeys = (obj: any, prefix = ''): string[] => {
      const keys: string[] = [];
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null) {
          keys.push(...flattenKeys(value, fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys;
    };

    const baseKeys = flattenKeys(baseTranslations);

    availableLanguages.forEach(lang => {
      if (lang === baseLanguage) return;
      
      const missingKeys: string[] = [];
      baseKeys.forEach(key => {
        if (!TranslationUtils.hasTranslation(key, lang)) {
          missingKeys.push(key);
        }
      });
      
      if (missingKeys.length > 0) {
        report[lang] = missingKeys;
      }
    });

    return report;
  }
}

import { describe, test, expect, beforeAll } from 'vitest';
import { TranslationValidator } from '@/utils/translationValidator';
import { getTranslations } from '@/translations';
import type { SupportedLanguage } from '@/types/translation';

describe('Translation Coverage Tests', () => {
  const supportedLanguages: SupportedLanguage[] = ['az', 'en', 'ru', 'tr'];
  const coreModules = [
    'auth', 'core', 'dashboard', 'navigation', 'userManagement'
  ];

  beforeAll(async () => {
    // Preload translations for faster tests
    for (const lang of supportedLanguages) {
      await getTranslations(lang);
    }
  });

  describe('Core Modules Completeness', () => {
    coreModules.forEach(module => {
      test(`${module} module should have complete Azerbaijani translations`, async () => {
        const result = await TranslationValidator.validateModule(module, 'az');
        
        expect(result.valid, 
          `Module ${module} has missing/invalid keys: ${result.missingKeys.concat(result.invalidKeys).join(', ')}`
        ).toBe(true);
        
        expect(result.coverage).toBeGreaterThanOrEqual(95);
      });
    });
  });

  describe('Translation Key Consistency', () => {
    test('All languages should have consistent key structure', async () => {
      const azTranslations = await getTranslations('az');
      
      for (const lang of supportedLanguages.filter(l => l !== 'az')) {
        const langTranslations = await getTranslations(lang);
        
        // Check that all modules exist
        for (const module of Object.keys(azTranslations)) {
          expect(langTranslations).toHaveProperty(module, 
            `Language ${lang} is missing module: ${module}`);
        }
      }
    });

    test('No translation keys should return placeholder format', async () => {
      const azTranslations = await getTranslations('az');
      const placeholderPattern = /^\[.*\]$/;
      
      const checkForPlaceholders = (obj: any, path: string = '') => {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (typeof value === 'string') {
            expect(value).not.toMatch(placeholderPattern, 
              `Translation key ${currentPath} returns placeholder: ${value}`);
          } else if (typeof value === 'object' && value !== null) {
            checkForPlaceholders(value, currentPath);
          }
        }
      };

      for (const [module, translations] of Object.entries(azTranslations)) {
        checkForPlaceholders(translations, module);
      }
    });
  });

  describe('Translation Quality', () => {
    test('Azerbaijani translations should contain proper characters', async () => {
      const azTranslations = await getTranslations('az');
      const azerbaijaniChars = /[əğıışçöü]/;
      
      let hasAzerbaijaniContent = false;
      
      const checkAzerbaijaniContent = (obj: any) => {
        for (const value of Object.values(obj)) {
          if (typeof value === 'string') {
            if (azerbaijaniChars.test(value)) {
              hasAzerbaijaniContent = true;
              return;
            }
          } else if (typeof value === 'object' && value !== null) {
            checkAzerbaijaniContent(value);
            if (hasAzerbaijaniContent) return;
          }
        }
      };

      checkAzerbaijaniContent(azTranslations);
      
      expect(hasAzerbaijaniContent).toBe(true, 
        'Azerbaijani translations should contain native characters (ə, ğ, ı, ş, ç, ö, ü)');
    });

    test('No translations should be empty strings', async () => {
      for (const lang of supportedLanguages) {
        const translations = await getTranslations(lang);
        
        const checkEmptyStrings = (obj: any, path: string = '') => {
          for (const [key, value] of Object.entries(obj)) {
            const currentPath = path ? `${path}.${key}` : key;
            
            if (typeof value === 'string') {
              expect(value.trim()).not.toBe('', 
                `Empty translation found at ${lang}.${currentPath}`);
            } else if (typeof value === 'object' && value !== null) {
              checkEmptyStrings(value, currentPath);
            }
          }
        };

        checkEmptyStrings(translations);
      }
    });
  });

  describe('Performance Tests', () => {
    test('Translation loading should be fast', async () => {
      const startTime = performance.now();
      
      await getTranslations('az');
      
      const loadTime = performance.now() - startTime;
      expect(loadTime).toBeLessThan(100); // Should load in less than 100ms
    });

    test('Validation should complete quickly', async () => {
      const startTime = performance.now();
      
      await TranslationValidator.validateAllModules('az');
      
      const validationTime = performance.now() - startTime;
      expect(validationTime).toBeLessThan(1000); // Should complete in less than 1 second
    });
  });

  describe('Integration Tests', () => {
    test('All translation keys used in components should exist', async () => {
      // Bu test real component scan tələb edir
      // Hələlik mock test
      const commonKeys = [
        'core.actions.save',
        'core.actions.cancel',
        'core.actions.delete',
        'navigation.dashboard',
        'auth.login.title',
        'userManagement.title'
      ];

      const azTranslations = await getTranslations('az');
      
      for (const key of commonKeys) {
        const [module, ...keyPath] = key.split('.');
        let current = azTranslations[module as keyof typeof azTranslations];
        
        for (const part of keyPath) {
          expect(current).toHaveProperty(part, 
            `Translation key ${key} not found`);
          current = current[part];
        }
      }
    });
  });

  describe('Error Handling', () => {
    test('Should handle invalid module names gracefully', async () => {
      const result = await TranslationValidator.validateModule('nonexistent', 'az');
      
      expect(result.valid).toBe(false);
      expect(result.coverage).toBe(0);
    });

    test('Should handle invalid language codes gracefully', async () => {
      try {
        await getTranslations('invalid' as SupportedLanguage);
        expect.fail('Should have thrown an error for invalid language');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});

describe('Translation Coverage Requirements', () => {
  test('Overall coverage should meet minimum requirements', async () => {
    const coverage = await TranslationValidator.validateAllModules('az');
    
    const totalModules = Object.keys(coverage).length;
    const completedModules = Object.values(coverage).filter(m => m.completed).length;
    const completionRate = completedModules / totalModules;
    
    expect(completionRate).toBeGreaterThanOrEqual(0.8, 
      'At least 80% of modules should be fully translated');
  });

  test('Critical modules should have 100% coverage', async () => {
    const criticalModules = ['auth', 'navigation', 'core'];
    
    for (const module of criticalModules) {
      const result = await TranslationValidator.validateModule(module, 'az');
      expect(result.coverage).toBe(100, 
        `Critical module ${module} must have 100% coverage`);
    }
  });
});

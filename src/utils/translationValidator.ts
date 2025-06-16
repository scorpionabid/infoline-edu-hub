
import { SupportedLanguage, TranslationValidationResult } from '@/types/translation';

/**
 * Validates translation completeness across languages
 */
export class TranslationValidator {
  private static requiredKeys = [
    'common.add',
    'common.edit', 
    'common.delete',
    'common.save',
    'common.cancel',
    'common.confirm',
    'common.loading',
    'common.error',
    'common.success',
    'dialogs.deleteSchool',
    'dialogs.deleteSchoolWarning',
    'dialogs.deleteSchoolConsequences',
    'dialogs.deleteCategory',
    'dialogs.deleteCategoryWarning',
    'dialogs.deleteCategoryConsequences',
    'dialogs.deleteSector',
    'dialogs.deleteSectorWarning',
    'dialogs.deleteSectorConsequences'
  ];

  static validateLanguage(
    language: SupportedLanguage,
    translationFunction: (key: string) => string
  ): TranslationValidationResult {
    const missingKeys: string[] = [];
    const invalidKeys: string[] = [];

    this.requiredKeys.forEach(key => {
      const translated = translationFunction(key);
      
      // If translation equals key, it's likely missing
      if (translated === key) {
        missingKeys.push(key);
      }
      
      // Additional validation rules
      if (translated.length === 0) {
        invalidKeys.push(key);
      }
    });

    return {
      valid: missingKeys.length === 0 && invalidKeys.length === 0,
      missingKeys,
      invalidKeys
    };
  }

  static logValidationResults(language: SupportedLanguage, result: TranslationValidationResult) {
    if (!result.valid) {
      console.warn(`Translation validation failed for ${language}:`);
      if (result.missingKeys.length > 0) {
        console.warn('Missing keys:', result.missingKeys);
      }
      if (result.invalidKeys.length > 0) {
        console.warn('Invalid keys:', result.invalidKeys);
      }
    } else {
      console.log(`Translation validation passed for ${language}`);
    }
  }
}

export default TranslationValidator;

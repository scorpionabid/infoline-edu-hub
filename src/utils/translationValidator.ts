
import { SupportedLanguage, TranslationValidationResult } from '@/types/translation';

/**
 * Validates translation completeness across languages
 */
export class TranslationValidator {
  // Define all required translation keys organized by feature/module
  private static requiredKeys = {
    common: [
      'add', 'edit', 'delete', 'save', 'cancel', 'confirm', 'loading', 'error', 'success',
      'search', 'noResults', 'actions', 'selectAll', 'deselectAll', 'apply', 'reset'
    ],
    dataTable: [
      'actions', 'loading', 'errorLoading', 'tryAgainLater', 'noData', 'noDataDescription',
      'delete', 'cancel', 'confirmDelete', 'deleteConfirmation', 'edit', 'view',
      'selectAll', 'deselectAll', 'rowsPerPage', 'of', 'next', 'previous', 'first', 'last'
    ],
    userForm: [
      'fullName', 'email', 'password', 'phone', 'position', 'role', 'region', 'sector', 'school',
      'language', 'selectRegion', 'selectSector', 'selectSchool', 'selectLanguage',
      'unknownRegion', 'unknownSector', 'unknownSchool', 'azerbaijani', 'english', 'russian', 'turkish',
      'regionadmin', 'sectoradmin', 'schooladmin', 'superadmin', 'user', 'saveChanges', 'createUser'
    ],
    navigation: [
      'dashboard', 'users', 'schools', 'sectors', 'reports', 'settings', 'logout',
      'profile', 'help', 'notifications', 'categories', 'columns', 'statistics', 'auth'
    ],
    validation: [
      'required', 'invalidEmail', 'minLength', 'maxLength', 'passwordsDontMatch',
      'invalidPhone', 'invalidDate', 'invalidNumber', 'requiredField', 'invalidFormat'
    ],
    dialogs: [
      'confirm', 'cancel', 'delete', 'areYouSure', 'thisActionCannotBeUndone'
    ]
  };

  // Define required translation groups that must be present
  private static requiredGroups = [
    'common', 'dataTable', 'navigation', 'validation'
  ];

  // Optional groups that may be present but aren't required
  private static optionalGroups = [
    'userForm', 'dialogs', 'userManagement', 'auth', 'statistics'
  ];

  /**
   * Checks if a key exists in the translations
   */
  private static keyExists(translationFunction: (key: string) => string, key: string): boolean {
    const value = translationFunction(key);
    return value !== '' && value !== `[missing "${key}" translation]`;
  }

  /**
   * Validates translation completeness for a specific language
   */
  static validateLanguage(
    language: SupportedLanguage,
    translationFunction: (key: string) => string
  ): TranslationValidationResult {
    const missingKeys: string[] = [];
    const invalidKeys: string[] = [];
    const missingGroups: string[] = [];
    
    // Track which groups are actually present
    const presentGroups = new Set<string>();
    
    // Check all possible groups (required + optional)
    const allGroups = [...this.requiredGroups, ...this.optionalGroups];
    
    for (const group of allGroups) {
      const groupKey = `${group}.dummy`; // Test with a dummy key to see if group exists
      if (this.keyExists(translationFunction, groupKey.replace('.dummy', '.dummy'))) {
        presentGroups.add(group);
      }
    }

    // Check for missing required groups
    this.requiredGroups.forEach(group => {
      if (!presentGroups.has(group)) {
        missingGroups.push(group);
      }
    });

    // Check for missing keys in each group
    Object.entries(this.requiredKeys).forEach(([group, keys]) => {
      // Skip if group is optional and not present
      if (this.optionalGroups.includes(group) && !presentGroups.has(group)) {
        return;
      }

      // Check each key in the group
      keys.forEach(key => {
        const fullKey = `${group}.${key}`;
        const keyParts = key.split('.');
        let currentKey = group;
        let keyExists = true;

        // Handle nested keys (e.g., 'user.name')
        for (const part of keyParts) {
          const testKey = `${currentKey}.${part}`;
          if (!this.keyExists(translationFunction, testKey)) {
            keyExists = false;
            break;
          }
          currentKey = testKey;
        }

        if (!keyExists) {
          missingKeys.push(fullKey);
        }
      });
    });

    // Check for keys with empty values
    const allKeys = Object.entries(this.requiredKeys).flatMap(([group, keys]) => 
      keys.map(key => `${group}.${key}`)
    );

    allKeys.forEach(fullKey => {
      const value = translationFunction(fullKey);
      if (value === '' || value === `[missing "${fullKey}" translation]`) {
        if (!missingKeys.includes(fullKey)) {
          missingKeys.push(fullKey);
        }
      } else if (value === fullKey) {
        // Key exists but has the same value as the key (likely untranslated)
        invalidKeys.push(fullKey);
      } else if (value.includes('{{') && !value.includes('}}')) {
        invalidKeys.push(`${fullKey} (unclosed placeholder)`);
      }
    });

    const isValid = missingKeys.length === 0 && missingGroups.length === 0 && invalidKeys.length === 0;

    return {
      valid: missingKeys.length === 0 && invalidKeys.length === 0 && missingGroups.length === 0,
      missingKeys,
      invalidKeys,
      missingGroups
    };
  }

  /**
   * Logs validation results to the console
   */
  static logValidationResults(language: SupportedLanguage, result: TranslationValidationResult) {
    if (!result.valid) {
      console.warn(`\n=== Translation Validation Results (${language}) ===`);
      
      if (result.missingGroups && result.missingGroups.length > 0) {
        console.warn('\n❌ Missing translation groups:');
        result.missingGroups.forEach(group => console.warn(`  - ${group}`));
      }
      
      if (result.missingKeys && result.missingKeys.length > 0) {
        console.warn(`\n❌ Missing ${result.missingKeys.length} translation keys:`);
        result.missingKeys.slice(0, 20).forEach(key => console.warn(`  - ${key}`));
        
        if (result.missingKeys.length > 20) {
          console.warn(`  ... and ${result.missingKeys.length - 20} more`);
        }
      }
      
      if (result.invalidKeys && result.invalidKeys.length > 0) {
        console.warn(`\n⚠️  ${result.invalidKeys.length} translations need attention:`);
        result.invalidKeys.slice(0, 10).forEach(key => console.warn(`  - ${key}`));
        
        if (result.invalidKeys.length > 10) {
          console.warn(`  ... and ${result.invalidKeys.length - 10} more`);
        }
      }
      
      console.log('\nRun `npm run validate:translations` to see all issues.\n');
    } else {
      console.log(`\n✅ Translation validation passed for ${language}\n`);
    }
  }
}

export default TranslationValidator;

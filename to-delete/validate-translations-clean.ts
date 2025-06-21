// Clean translation validation script for InfoLine project

import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';

// Types
type TranslationData = Record<string, any>;
type SupportedLanguage = 'az' | 'en' | 'ru' | 'tr';

// Path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const LOCALES_DIR = join(__dirname, '..', 'src', 'locales');
const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['az', 'en', 'ru', 'tr'];

// Required translation keys by group
const REQUIRED_KEYS = {
  common: [
    'add', 'edit', 'delete', 'save', 'cancel', 'confirm', 'loading', 
    'error', 'success', 'search', 'noResults', 'actions', 'selectAll', 
    'deselectAll', 'apply', 'reset'
  ],
  dataTable: [
    'actions', 'loading', 'errorLoading', 'tryAgainLater', 'noData', 
    'noDataDescription', 'delete', 'cancel', 'confirmDelete', 
    'deleteConfirmation', 'edit', 'view', 'selectAll', 'deselectAll',
    'rowsPerPage', 'of', 'next', 'previous', 'first', 'last'
  ],
  userForm: [
    'fullName', 'email', 'password', 'phone', 'position', 'role', 
    'region', 'sector', 'school', 'language', 'selectRegion', 
    'selectSector', 'selectSchool', 'selectLanguage', 'unknownRegion', 
    'unknownSector', 'unknownSchool', 'azerbaijani', 'english', 
    'russian', 'turkish', 'regionadmin', 'sectoradmin', 'schooladmin', 
    'superadmin', 'user', 'saveChanges', 'createUser'
  ],
  navigation: [
    'dashboard', 'users', 'schools', 'sectors', 'reports', 'settings', 
    'logout', 'profile', 'help', 'notifications', 'categories', 
    'columns', 'statistics', 'auth'
  ],
  validation: [
    'required', 'invalidEmail', 'minLength', 'maxLength', 
    'passwordsDontMatch', 'invalidPhone', 'invalidDate', 
    'invalidNumber', 'requiredField', 'invalidFormat'
  ],
  dialogs: [
    'confirm', 'cancel', 'delete', 'areYouSure', 'thisActionCannotBeUndone'
  ]
};

// Required groups that must be present in all translations
const REQUIRED_GROUPS = ['common', 'dataTable', 'navigation', 'validation'];

// Optional groups that may be present but aren't required
const OPTIONAL_GROUPS = ['userForm', 'dialogs', 'userManagement', 'auth', 'statistics'];

/**
 * Load translations from a JSON file
 */
async function loadTranslations(lang: string): Promise<{ data: TranslationData; lang: string }> {
  const filePath = join(LOCALES_DIR, `${lang}.json`);
  try {
    const content = await readFile(filePath, 'utf-8');
    return { data: JSON.parse(content), lang };
  } catch (error) {
    console.error(chalk.red(`❌ Error loading ${filePath}:`), error);
    return { data: {}, lang };
  }
}

/**
 * Check if a key exists in the translations
 */
function hasTranslation(translations: TranslationData, key: string): boolean {
  const keys = key.split('.');
  let value: any = { ...translations };
  
  for (const k of keys) {
    if (value === null || typeof value !== 'object' || !(k in value)) {
      return false;
    }
    value = value[k];
  }
  
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Validate translations for a specific language
 */
async function validateLanguage(lang: SupportedLanguage) {
  console.log(chalk.blue(`\n🔍 Validating ${lang.toUpperCase()} translations...`));
  
  // Load the translations
  const { data: translations } = await loadTranslations(lang);
  
  // Log top-level keys for debugging
  console.log(chalk.dim(`📂 [${lang.toUpperCase()}] Top-level keys:`), 
    Object.keys(translations).join(', '));
  
  const missingKeys: string[] = [];
  const invalidKeys: string[] = [];
  const missingGroups: string[] = [];
  
  // Check required groups
  for (const group of REQUIRED_GROUPS) {
    if (!(group in translations)) {
      missingGroups.push(group);
    }
  }
  
  // Check all required keys
  for (const [group, keys] of Object.entries(REQUIRED_KEYS)) {
    // Skip if group is optional and not present
    if (OPTIONAL_GROUPS.includes(group) && !(group in translations)) {
      continue;
    }
    
    for (const key of keys) {
      const fullKey = `${group}.${key}`;
      if (!hasTranslation(translations, `${group}.${key}`)) {
        missingKeys.push(fullKey);
      }
    }
  }
  
  // Check for empty values
  for (const [group, keys] of Object.entries(REQUIRED_KEYS)) {
    if (OPTIONAL_GROUPS.includes(group) && !(group in translations)) {
      continue;
    }
    
    for (const key of keys) {
      const fullKey = `${group}.${key}`;
      const value = getNestedValue(translations, fullKey);
      
      if (value === '') {
        invalidKeys.push(`${fullKey} (empty string)`);
      } else if (typeof value === 'string' && value.includes('{{') && !value.includes('}}')) {
        invalidKeys.push(`${fullKey} (unclosed placeholder)`);
      }
    }
  }
  
  const isValid = missingKeys.length === 0 && invalidKeys.length === 0 && missingGroups.length === 0;
  
  // Print results
  if (isValid) {
    console.log(chalk.green(`✅ All translations are valid for ${lang.toUpperCase()}`));
  } else {
    console.log(chalk.red(`❌ Validation failed for ${lang.toUpperCase()}`));
    
    if (missingKeys.length > 0) {
      console.log(chalk.yellow('\n🔍 Missing keys:'));
      missingKeys.forEach((key, i) => console.log(`  ${i + 1}. ${chalk.yellow(key)}`));
    }
    
    if (invalidKeys.length > 0) {
      console.log(chalk.yellow('\n⚠️  Invalid keys:'));
      invalidKeys.forEach((key, i) => console.log(`  ${i + 1}. ${chalk.yellow(key)}`));
    }
    
    if (missingGroups.length > 0) {
      console.log(chalk.yellow('\n❌ Missing required groups:'));
      missingGroups.forEach((group, i) => console.log(`  ${i + 1}. ${chalk.yellow(group)}`));
    }
  }
  
  return {
    language: lang,
    isValid,
    missingKeys,
    invalidKeys,
    missingGroups,
    stats: {
      totalKeys: Object.values(REQUIRED_KEYS).flat().length,
      missingKeys: missingKeys.length,
      invalidKeys: invalidKeys.length,
      missingGroups: missingGroups.length
    }
  };
}

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((o, p) => (o || {})[p], obj);
}

/**
 * Main validation function
 */
async function validateAllTranslations() {
  console.log(chalk.blue('\n🔍 Starting translation validation...'));
  
  // Validate each language
  const results = await Promise.all(
    SUPPORTED_LANGUAGES.map(lang => validateLanguage(lang))
  );
  
  // Generate a summary
  console.log(chalk.blue('\n📊 Validation Summary:'));
  console.log(chalk.blue('='.repeat(50)));
  
  let hasErrors = false;
  
  for (const result of results) {
    const status = result.isValid ? chalk.green('✓') : chalk.red('✗');
    console.log(`  ${status} ${result.language.toUpperCase()}: ` +
      `${chalk.yellow(result.missingKeys.length)} missing, ` +
      `${chalk.yellow(result.invalidKeys.length)} invalid, ` +
      `${chalk.yellow(result.missingGroups.length)} missing groups`);
    
    if (!result.isValid) {
      hasErrors = true;
    }
  }
  
  if (hasErrors) {
    console.log(chalk.red('\n❌ Some translations failed validation'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All translations are valid!'));
  }
}

// Run the validation
console.time('Validation completed in');
validateAllTranslations()
  .then(() => console.timeEnd('Validation completed in'))
  .catch(error => {
    console.error(chalk.red('❌ Validation failed:'), error);
    process.exit(1);
  });

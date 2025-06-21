// Translation validation script for InfoLine project

import { readFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';

// Use dynamic import for ESM modules in CommonJS context
const chalk = (await import('chalk')).default;
const { TranslationValidator } = await import('../src/utils/translationValidator.js');
import type { SupportedLanguage } from '../src/types/translation.js';

type TranslationData = Record<string, any>;

// Get current directory
const __filename = new URL(import.meta.url).pathname;
const __dirname = dirname(__filename);

// Path to locales directory
const LOCALES_DIR = join(__dirname, '..', 'src', 'locales');

// Supported languages
const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['az', 'en', 'ru', 'tr'];

// Track missing keys across all languages
const allMissingKeys = new Map<string, Set<string>>();
const allInvalidKeys = new Map<string, Set<string>>();

/**
 * Creates a translation function that works with nested objects
 */
function createTranslator(translations: TranslationData, lang: string, debug = false) {
  return (key: string): string => {
    const keys = key.split('.');
    let value: any = { ...translations };
    
    // Special debug for validation keys
    if (debug) {
      console.log(`  🔍 [${lang}] Looking up key: ${key}`);
    }
    
    // Special case for dummy keys used for group detection
    if (key.endsWith('.dummy')) {
      const group = key.replace('.dummy', '');
      return group in translations ? 'group-exists' : '';
    }
    
    for (const k of keys) {
      if (value === null || typeof value !== 'object' || !(k in value)) {
        if (debug) {
          console.log(`  ❌ [${lang}] Missing key: ${key}`);
        }
        return ''; // Key not found
      }
      value = value[k];
    }
    
    // Return empty string for non-string values (they might be valid nested objects)
    if (typeof value !== 'string') {
      if (debug) {
        console.log(`  ⚠️ [${lang}] Non-string value for key ${key}:`, typeof value);
      }
      return '';
    }
    
    return value;
  };
}

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
 * Validate translations for a specific language
 */
async function validateLanguage(lang: SupportedLanguage) {
  console.log(chalk.blue(`\n🔍 Validating ${lang.toUpperCase()} translations...`));
  
  // Load the translations
  const { data: translations } = await loadTranslations(lang);
  
  // Log top-level keys for debugging
  console.log(chalk.dim(`📂 [${lang.toUpperCase()}] Top-level keys:`), 
    Object.keys(translations).join(', '));
  
  // Create a translator function
  const t = createTranslator(translations, lang, false);
  
  // Run validation
  const result = TranslationValidator.validateLanguage(lang, t);
  
  // Track missing and invalid keys
  if (result.missingKeys.length > 0) {
    allMissingKeys.set(lang, new Set(result.missingKeys));
  }
  
  if (result.invalidKeys.length > 0) {
    allInvalidKeys.set(lang, new Set(result.invalidKeys));
  }
  
  // Print results
  if (result.isValid) {
    console.log(chalk.green(`✅ All translations are valid for ${lang.toUpperCase()}`));
  } else {
    console.log(chalk.red(`❌ Validation failed for ${lang.toUpperCase()}`));
    
    if (result.missingKeys.length > 0) {
      console.log(chalk.yellow('\n🔍 Missing keys:'));
      result.missingKeys.forEach((key, i) => 
        console.log(`  ${i + 1}. ${chalk.yellow(key)}`)
      );
    }
    
    if (result.missingGroups.length > 0) {
      console.log(chalk.yellow('\n❌ Missing required groups:'));
      result.missingGroups.forEach((group, i) => 
        console.log(`  ${i + 1}. ${chalk.yellow(group)}`)
      );
    }
  }
  
  return result;
}

/**
 * Main validation function
 */
async function validateTranslations() {
  console.log(chalk.blue('\n🔍 Starting translation validation...'));
  
  // Validate each language
  const results = await Promise.all(
    SUPPORTED_LANGUAGES.map(lang => validateLanguage(lang))
  );
  
  // Generate a summary
  const hasErrors = results.some(r => !r.isValid);
  
  console.log(chalk.blue('\n📊 Validation Summary:'));
  console.log(chalk.blue('===================='));
  
  results.forEach(result => {
    const status = result.isValid ? chalk.green('✓') : chalk.red('✗');
    console.log(`  ${status} ${result.language.toUpperCase()}: ` +
      `${result.missingKeys.length} missing, ` +
      `${result.invalidKeys.length} invalid, ` +
      `${result.missingGroups.length} missing groups`);
  });
  
  if (hasErrors) {
    console.log(chalk.red('\n❌ Some translations failed validation'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All translations are valid!'));
  }
}

// Run the validation
console.time('Validation completed in');
validateTranslations()
  .then(() => console.timeEnd('Validation completed in'))
  .catch(error => {
    console.error(chalk.red('❌ Validation failed:'), error);
    process.exit(1);
  });
    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    // Log top-level keys for debugging
    console.log(`\n📂 [${lang.toUpperCase()}] Top-level keys:`, Object.keys(data).join(', '));
    
    // Check for required top-level groups
    const requiredGroups = ['common', 'validation', 'navigation'];
    const missingGroups = requiredGroups.filter(g => !(g in data));
    if (missingGroups.length > 0) {
      console.log(`  ⚠️ [${lang}] Missing required groups:`, missingGroups.join(', '));
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Error loading ${lang} translations:`, error);
    return {};
  }
}

async function validateTranslations() {
  console.log('🔍 Validating translations...\n');
  
  const languages: SupportedLanguage[] = ['az', 'en', 'ru', 'tr'];
  let hasErrors = false;
  
  for (const lang of languages) {
    console.log(`\n${'='.repeat(40)}`);
    console.log(`🌐 Validating ${lang.toUpperCase()} translations`);
    console.log(`${'='.repeat(40)}`);
    
    const translations = await loadTranslations(lang);
    const translate = createTranslator(translations, lang);
    
    console.log('\n🔍 Running validation...');
    const result = TranslationValidator.validateLanguage(lang, translate);
    
    if (result.isValid) {
      console.log('\n✅ Translation validation passed for', lang);
    } else {
      console.error('\n❌ Translation validation failed for', lang);
      
      if (result.missingKeys.length > 0) {
        console.error('\n🔍 Missing keys:');
        result.missingKeys.forEach((key, i) => 
          console.log(`  ${i + 1}. ${key}`)
        );
      }
      
      if (result.invalidKeys.length > 0) {
        console.error('\n⚠️  Invalid keys:');
        result.invalidKeys.forEach((key, i) => 
          console.log(`  ${i + 1}. ${key}`)
        );
      }
      
      if (result.missingGroups.length > 0) {
        console.error('\n❌ Missing required groups:');
        result.missingGroups.forEach((group, i) => 
          console.log(`  ${i + 1}. ${group}`)
        );
      }
      
      hasErrors = true;
    }
    
    console.log('\n' + '─'.repeat(80) + '\n');
  }
  
  if (hasErrors) {
    console.error('❌ Some translations failed validation');
    process.exit(1);
  } else {
    console.log('✅ All translations are valid!');
    process.exit(0);
  }
}

// Run the validation
console.time('Validation completed in');
validateTranslations()
  .then(() => console.timeEnd('Validation completed in'))
  .catch(error => {
    console.error('❌ Unhandled error during validation:', error);
    process.exit(1);
  });

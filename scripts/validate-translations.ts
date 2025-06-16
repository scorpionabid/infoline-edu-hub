import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TranslationValidator } from '../src/utils/translationValidator.js';
import type { SupportedLanguage } from '../src/types/translation.js';

// Get current file and directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get current file and directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const LOCALES_DIR = path.join(ROOT_DIR, 'src/locales');
const LANGUAGES: SupportedLanguage[] = ['az', 'en', 'ru', 'tr'];

type TranslationStructure = {
  [key: string]: string | TranslationStructure;
};

// Helper to load a JSON file
function loadJSONFile<T = any>(filePath: string): T | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error loading ${filePath}:`, error);
    return null;
  }
}

// Helper to load all translations for a language
function loadTranslations(lang: SupportedLanguage): Record<string, any> | null {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`);
  return loadJSONFile<Record<string, any>>(filePath);
}

// Create a mock translation function for validation
function createTranslationFunction(translations: Record<string, any>): (key: string) => string {
  return (key: string) => {
    const keys = key.split('.');
    let value: any = { ...translations };
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if not found (mimics i18n behavior)
      }
    }
    
    return typeof value === 'string' ? value : key;
  };
}

// Validate translations for all languages
async function validateAllTranslations() {
  console.log('🔍 Validating translations...\n');
  
  let hasErrors = false;
  
  for (const lang of LANGUAGES) {
    console.log(`🌐 Validating ${lang.toUpperCase()} translations...`);
    
    const translations = loadTranslations(lang);
    if (!translations) {
      console.error(`❌ Failed to load translations for ${lang}`);
      hasErrors = true;
      continue;
    }
    
    const t = createTranslationFunction(translations);
    const result = TranslationValidator.validateLanguage(lang, t);
    TranslationValidator.logValidationResults(lang, result);
    
    if (!result.valid) {
      hasErrors = true;
    }
    
    console.log('─'.repeat(80) + '\n');
  }
  
  if (hasErrors) {
    console.error('❌ Translation validation failed');
    process.exit(1);
  } else {
    console.log('✅ All translations are valid!');
    process.exit(0);
  }
}

// Run the validation
validateAllTranslations().catch(error => {
  console.error('❌ Unhandled error during validation:', error);
  process.exit(1);
});

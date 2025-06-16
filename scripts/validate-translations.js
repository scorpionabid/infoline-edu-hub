import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const LOCALES_DIR = path.join(ROOT_DIR, 'src/locales');
const TS_TRANSLATIONS_DIR = path.join(ROOT_DIR, 'src/translations');
const LANGUAGES = ['az', 'en', 'ru', 'tr'];

// Helper to flatten nested translation objects
function flattenTranslations(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      acc[fullKey] = value;
    } else if (value && typeof value === 'object') {
      Object.assign(acc, flattenTranslations(value, fullKey));
    }
    return acc;
  }, {});
}

// Extract keys from TypeScript translation files
async function getTSTranslationKeys() {
  const result = {};
  
  for (const lang of LANGUAGES) {
    const langDir = path.join(TS_TRANSLATIONS_DIR, lang);
    
    // Check if directory exists
    try {
      await fs.access(langDir);
    } catch {
      console.log(`Skipping non-existent directory: ${langDir}`);
      continue; // Skip if directory doesn't exist
    }
    
    try {
      const files = (await fs.readdir(langDir)).filter(f => f.endsWith('.ts'));
      const langKeys = [];
      
      for (const file of files) {
        const modulePath = path.join(langDir, file);
        try {
          // Use dynamic import for ES modules
          const module = await import(modulePath);
          const translations = module.default || module;
          const flat = flattenTranslations(translations);
          langKeys.push(...Object.keys(flat));
        } catch (error) {
          console.error(`Error processing ${modulePath}:`, error);
        }
      }
      
      if (langKeys.length > 0) {
        result[lang] = [...new Set(langKeys)].sort();
      }
    
    } catch (error) {
      console.error(`Error processing language ${lang}:`, error);
    }
  }
  
  return result;
}

// Extract keys from JSON locale files
async function getJSONTranslationKeys() {
  const result = {};
  
  for (const lang of LANGUAGES) {
    const filePath = path.join(LOCALES_DIR, `${lang}.json`);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      console.log(`Skipping non-existent file: ${filePath}`);
      continue; // Skip if file doesn't exist
    }
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const json = JSON.parse(content);
      const flat = flattenTranslations(json);
      result[lang] = Object.keys(flat).sort();
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }
  
  return result;
}

// Compare keys between TypeScript and JSON translations
async function compareTranslations() {
  console.log('🔍 Validating translation keys...\n');
  
  const tsKeys = await getTSTranslationKeys();
  const jsonKeys = await getJSONTranslationKeys();
  
  // Compare each language
  for (const lang of LANGUAGES) {
    console.log(`🌐 Language: ${lang.toUpperCase()}`);
    
    const tsLangKeys = tsKeys[lang] || [];
    const jsonLangKeys = jsonKeys[lang] || [];
    
    console.log(`TypeScript keys: ${tsLangKeys.length}`);
    console.log(`JSON keys: ${jsonLangKeys.length}\n`);
    
    // Find keys in TS but not in JSON
    const missingInJSON = tsLangKeys.filter(k => !jsonLangKeys.includes(k));
    if (missingInJSON.length > 0) {
      console.log(`❌ Missing in ${lang}.json (${missingInJSON.length}):`);
      console.log(missingInJSON.join('\n') + '\n');
    }
    
    // Find keys in JSON but not in TS
    const extraInJSON = jsonLangKeys.filter(k => !tsLangKeys.includes(k));
    if (extraInJSON.length > 0) {
      console.log(`⚠️  Extra keys in ${lang}.json (${extraInJSON.length}):`);
      console.log(extraInJSON.join('\n') + '\n');
    }
    
    if (missingInJSON.length === 0 && extraInJSON.length === 0) {
      console.log('✅ All keys match!\n');
    }
    
    console.log('─'.repeat(80) + '\n');
  }
}

// Run the comparison
(async () => {
  try {
    await compareTranslations();
    process.exit(0);
  } catch (error) {
    console.error('Error during translation validation:', error);
    process.exit(1);
  }
})();

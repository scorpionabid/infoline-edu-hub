import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join, resolve, relative } from 'path';
import { fileURLToPath } from 'url';
import process from 'process';

// Get current file and directory paths in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper to handle Windows paths
const normalizePath = (p: string): string => {
  return process.platform === 'win32' ? p.replace(/^\//, '') : p;
};

// Paths
const ROOT_DIR = resolve(__dirname, '..');
const LOCALES_DIR = join(ROOT_DIR, 'src/locales');
const TRANSLATIONS_DIR = join(ROOT_DIR, 'src/translations');

console.log('Root directory:', ROOT_DIR);
console.log('Locales directory:', LOCALES_DIR);
console.log('Translations directory:', TRANSLATIONS_DIR);

// Supported languages
const LANGUAGES = ['az', 'en', 'ru', 'tr'] as const;

// Module names based on the existing structure in translations/az/
const MODULES = [
  'auth',
  'categories',
  'dataEntry',
  'feedback',
  'general',
  'navigation',
  'notifications',
  'organization',
  'profile',
  'schools',
  'status',
  'time',
  'ui',
  'user',
  'validation'
];

// Ensure the translations directory exists
const ensureDirectoryExists = (dir: string): void => {
  try {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  } catch (error) {
    console.error(`Error creating directory ${dir}:`, error);
    throw error;
  }
};

// Convert a value to a TypeScript string literal
const toTsValue = (value: unknown): string => {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') return `'${value.replace(/'/g, "\\'")}'`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return `[${value.map(v => toTsValue(v)).join(', ')}]`;
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `'${k}': ${toTsValue(v)}`);
    return `{ ${entries.join(', ')} }`;
  }
  return 'null';
};

// Convert a module's translations to TypeScript
const convertModuleToTs = (moduleName: string, data: unknown): string => {
  const content = toTsValue(data);
  const typeName = moduleName.split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
    
  return `// Auto-generated file - do not edit manually

export const ${moduleName} = ${content} as const;

export type ${typeName} = typeof ${moduleName};
`;
};

// Main function to convert all locale files
const convertAllLocales = async (): Promise<void> => {
  console.log('\nStarting conversion of locale files...');
  console.log('Root directory:', ROOT_DIR);
  console.log('Locales directory:', LOCALES_DIR);
  console.log('Translations directory:', TRANSLATIONS_DIR);
  
  ensureDirectoryExists(TRANSLATIONS_DIR);
  
  let convertedCount = 0;
  let skippedCount = 0;

  for (const lang of LANGUAGES) {
    const localePath = join(LOCALES_DIR, `${lang}.json`);
    const langDir = join(TRANSLATIONS_DIR, lang);
    
    if (!existsSync(localePath)) {
      console.warn(`\n⚠️  Skipping ${lang}: ${localePath} not found`);
      skippedCount++;
      continue;
    }
    
    try {
      console.log(`\nProcessing ${lang}...`);
      const localeContent = readFileSync(localePath, 'utf8');
      const translations = JSON.parse(localeContent);
      
      // Ensure language directory exists
      if (!existsSync(langDir)) {
        mkdirSync(langDir, { recursive: true });
      }
      
      // Process each module
      for (const moduleName of MODULES) {
        const moduleData = translations[moduleName] || {};
        
        // Convert to TypeScript
        const tsContent = convertModuleToTs(moduleName, moduleData);
        
        // Write the file
        const outputPath = join(langDir, `${moduleName}.ts`);
        writeFileSync(outputPath, tsContent, 'utf8');
        console.log(`✅  Created: ${relative(ROOT_DIR, outputPath)}`);
        convertedCount++;
      }
      
      // Create index.ts for the language
      const indexContent = `// Auto-generated index file for ${lang} translations
${MODULES.map(m => `import ${m} from './${m}.js';`).join('\n')}

export {
${MODULES.map(m => `  ${m},`).join('\n')}
};
`;
      
      const indexPath = join(langDir, 'index.ts');
      writeFileSync(indexPath, indexContent, 'utf8');
      console.log(`✅  Created: ${relative(ROOT_DIR, indexPath)}`);
      
    } catch (error) {
      console.error(`❌  Error processing ${lang}:`, error);
      skippedCount++;
    }
  }
  
  console.log('\n✨  Conversion complete!');
  console.log(`✅  Successfully converted: ${convertedCount} modules`);
  if (skippedCount > 0) {
    console.log(`⚠️  Skipped: ${skippedCount} languages/modules`);
  }
};

// Run the conversion
convertAllLocales().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

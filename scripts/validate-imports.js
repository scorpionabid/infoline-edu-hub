#!/usr/bin/env node

/**
 * Import Validation Script for InfoLine
 * Scans for deprecated imports and suggests fixes
 */

const fs = require('fs');
const path = require('path');

const DEPRECATED_IMPORTS = [
  '@/context/LanguageContext',
  'useLanguageSafe',
  'useOptimizedTranslation',
  'LanguageProvider'
];

const VALID_REPLACEMENTS = {
  '@/context/LanguageContext': '@/contexts/TranslationContext',
  'useLanguageSafe': 'useTranslation',
  'useOptimizedTranslation': 'useSmartTranslation',
  'LanguageProvider': 'TranslationProvider'
};

function scanDirectory(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      scanDirectory(filePath, results);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      for (const deprecatedImport of DEPRECATED_IMPORTS) {
        if (content.includes(deprecatedImport)) {
          results.push({
            file: filePath,
            deprecated: deprecatedImport,
            replacement: VALID_REPLACEMENTS[deprecatedImport],
            line: findLineNumber(content, deprecatedImport)
          });
        }
      }
    }
  }
  
  return results;
}

function findLineNumber(content, searchText) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchText)) {
      return i + 1;
    }
  }
  return -1;
}

function main() {
  console.log('🔍 Scanning for deprecated imports...\n');
  
  const srcDir = path.join(process.cwd(), 'src');
  const issues = scanDirectory(srcDir);
  
  if (issues.length === 0) {
    console.log('✅ No deprecated imports found! All good! 🎉\n');
    return;
  }
  
  console.log(`❌ Found ${issues.length} deprecated import(s):\n`);
  
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.file}:${issue.line}`);
    console.log(`   ❌ Deprecated: ${issue.deprecated}`);
    console.log(`   ✅ Use instead: ${issue.replacement}\n`);
  });
  
  console.log('🛠️  Fix these imports to resolve build errors.\n');
  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = { scanDirectory, DEPRECATED_IMPORTS, VALID_REPLACEMENTS };
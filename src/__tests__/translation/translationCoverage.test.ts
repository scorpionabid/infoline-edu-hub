// Translation Coverage Test - Comprehensive hardcoded text detection
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Component files to check for hardcoded text
const COMPONENT_DIRECTORIES = [
  'src/components',
  'src/pages',
  'src/layouts'
];

// Patterns that indicate hardcoded Azerbaijani text
const AZERBAIJANI_PATTERNS = [
  // Common Azerbaijani words that shouldn't be hardcoded
  /["'].*[əıöüşçğĞ].*["']/g,
  // Common hardcoded phrases we found
  /"Yüklənir"/g,
  /"Xəta baş verdi"/g,
  /"Yenidən cəhd et"/g,
  /"Məktəb Dashboard"/g,
  /"Təsdiq gözləyən"/g,
  /"Təsdiqlənmiş"/g,
  /"Son tarixə yaxın"/g,
  /"Tamamlanma dərəcəsi"/g,
  /"Bildirişlər"/g,
  /"Məktəb adı"/g,
  /"Region seçin"/g,
  /"Sektor seçin"/g,
];

// Files to exclude from checking (e.g., test files, translation files)
const EXCLUDED_FILES = [
  '.test.',
  '.spec.',
  '/translations/',
  '__tests__',
  'node_modules'
];

function getAllTSXFiles(dir: string): string[] {
  let results: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return results;
  }

  const list = fs.readdirSync(dir);
  
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results = results.concat(getAllTSXFiles(filePath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      // Skip excluded files
      if (!EXCLUDED_FILES.some(excluded => filePath.includes(excluded))) {
        results.push(filePath);
      }
    }
  }
  
  return results;
}

function checkFileForHardcodedText(filePath: string): Array<{
  file: string;
  line: number;
  text: string;
  context: string;
}> {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const violations: Array<{
    file: string;
    line: number;
    text: string;
    context: string;
  }> = [];

  lines.forEach((line, index) => {
    AZERBAIJANI_PATTERNS.forEach(pattern => {
      const matches = line.match(pattern);
      if (matches) {
        matches.forEach(match => {
          violations.push({
            file: filePath,
            line: index + 1,
            text: match,
            context: line.trim()
          });
        });
      }
    });
  });

  return violations;
}

function checkTranslationKeyFormat(filePath: string): Array<{
  file: string;
  line: number;
  issue: string;
  context: string;
}> {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const violations: Array<{
    file: string;
    line: number;
    issue: string;
    context: string;
  }> = [];

  lines.forEach((line, index) => {
    // Check for inconsistent translation key formats
    const tCalls = line.match(/t\s*\(\s*["']([^"']+)["']\s*\)/g);
    
    if (tCalls) {
      tCalls.forEach(call => {
        // Extract the key from the t() call
        const keyMatch = call.match(/["']([^"']+)["']/);
        if (keyMatch) {
          const key = keyMatch[1];
          
          // Check if key follows dot notation pattern
          if (!key.includes('.') && key.length > 3) {
            violations.push({
              file: filePath,
              line: index + 1,
              issue: `Translation key "${key}" should use dot notation (e.g., module.key)`,
              context: line.trim()
            });
          }
          
          // Check for camelCase keys (should be snake_case)
          if (/[A-Z]/.test(key)) {
            violations.push({
              file: filePath,
              line: index + 1,
              issue: `Translation key "${key}" should use snake_case, not camelCase`,
              context: line.trim()
            });
          }
        }
      });
    }
  });

  return violations;
}

describe('Translation Coverage Tests', () => {
  let allFiles: string[] = [];

  beforeAll(() => {
    // Collect all component files
    COMPONENT_DIRECTORIES.forEach(dir => {
      if (fs.existsSync(dir)) {
        allFiles = allFiles.concat(getAllTSXFiles(dir));
      }
    });
  });

  it('should have no hardcoded Azerbaijani text in components', () => {
    const violations: Array<{
      file: string;
      line: number;
      text: string;
      context: string;
    }> = [];

    allFiles.forEach(file => {
      const fileViolations = checkFileForHardcodedText(file);
      violations.push(...fileViolations);
    });

    if (violations.length > 0) {
      console.error('\n🚨 HARDCODED AZERBAIJANI TEXT FOUND:');
      console.error('=' .repeat(50));
      
      const byFile = violations.reduce((acc, violation) => {
        if (!acc[violation.file]) acc[violation.file] = [];
        acc[violation.file].push(violation);
        return acc;
      }, {} as Record<string, typeof violations>);

      Object.entries(byFile).forEach(([file, fileViolations]) => {
        console.error(`\n📄 ${file}:`);
        fileViolations.forEach(v => {
          console.error(`  Line ${v.line}: ${v.text}`);
          console.error(`    Context: ${v.context}`);
        });
      });

      console.error(`\n💡 SOLUTION: Replace hardcoded text with translation keys:`);
      console.error(`   Example: "Yüklənir..." → t('ui.loading')`);
      console.error(`   Example: "Məktəb adı" → t('schools.school_name')`);
    }

    expect(violations).toEqual([]);
  });

  it('should use consistent translation key format', () => {
    const violations: Array<{
      file: string;
      line: number;
      issue: string;
      context: string;
    }> = [];

    allFiles.forEach(file => {
      const fileViolations = checkTranslationKeyFormat(file);
      violations.push(...fileViolations);
    });

    if (violations.length > 0) {
      console.error('\n🚨 INCONSISTENT TRANSLATION KEY FORMAT:');
      console.error('=' .repeat(50));
      
      violations.forEach(v => {
        console.error(`📄 ${v.file}:${v.line}`);
        console.error(`   Issue: ${v.issue}`);
        console.error(`   Context: ${v.context}`);
      });

      console.error(`\n💡 SOLUTION: Use dot notation with snake_case:`);
      console.error(`   ✅ CORRECT: t('ui.loading'), t('schools.school_name')`);
      console.error(`   ❌ WRONG: t('loading'), t('schoolName'), t('addSchool')`);
    }

    expect(violations).toEqual([]);
  });

  it('should have all translation modules populated', () => {
    const translationModules = [
      'src/translations/az/ui.ts',
      'src/translations/az/schools.ts',
      'src/translations/az/dashboard.ts',
      'src/translations/az/status.ts'
    ];

    const emptyModules: string[] = [];

    translationModules.forEach(module => {
      if (fs.existsSync(module)) {
        const content = fs.readFileSync(module, 'utf8');
        
        // Check if module exports an empty object
        if (content.includes('= {  } as const') || 
            content.includes('= { } as const')) {
          emptyModules.push(module);
        }

        // Check if module has minimal content (less than 10 keys)
        const exportMatch = content.match(/export const \w+ = \{([\s\S]*)\} as const/);
        if (exportMatch) {
          const moduleContent = exportMatch[1];
          const keyCount = (moduleContent.match(/\w+:/g) || []).length;
          
          if (keyCount < 5) {
            emptyModules.push(`${module} (only ${keyCount} keys)`);
          }
        }
      } else {
        emptyModules.push(`${module} (missing)`);
      }
    });

    if (emptyModules.length > 0) {
      console.error('\n🚨 EMPTY OR UNDERPOPULATED TRANSLATION MODULES:');
      console.error('=' .repeat(50));
      emptyModules.forEach(module => {
        console.error(`   📝 ${module}`);
      });
      console.error(`\n💡 SOLUTION: Populate translation modules with appropriate keys`);
    }

    expect(emptyModules).toEqual([]);
  });

  it('should have proper useTranslation imports in components', () => {
    const missingImports: string[] = [];

    allFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check if file uses t() function but doesn't import useTranslation
      if (content.includes('t(') && !content.includes('useTranslation')) {
        missingImports.push(file);
      }
    });

    if (missingImports.length > 0) {
      console.error('\n🚨 MISSING useTranslation IMPORTS:');
      console.error('=' .repeat(50));
      missingImports.forEach(file => {
        console.error(`   📄 ${file}`);
      });
      console.error(`\n💡 SOLUTION: Add import { useTranslation } from '@/contexts/TranslationContext'`);
      console.error(`   And add: const { t } = useTranslation();`);
    }

    expect(missingImports).toEqual([]);
  });

  it('should validate translation keys exist in modules', async () => {
    // This test checks if translation keys used in components actually exist
    const missingKeys: Array<{
      file: string;
      line: number;
      key: string;
      context: string;
    }> = [];

    // Load translation modules
    const azTranslations = await import('../../translations/az');
    
    allFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        const tCalls = line.match(/t\s*\(\s*["']([^"']+)["']\s*\)/g);
        
        if (tCalls) {
          tCalls.forEach(call => {
            const keyMatch = call.match(/["']([^"']+)["']/);
            if (keyMatch) {
              const key = keyMatch[1];
              
              // Check if key exists in translations
              const keyParts = key.split('.');
              let current = azTranslations.default;
              
              for (const part of keyParts) {
                if (current && typeof current === 'object' && part in current) {
                  current = current[part];
                } else {
                  missingKeys.push({
                    file,
                    line: index + 1,
                    key,
                    context: line.trim()
                  });
                  break;
                }
              }
            }
          });
        }
      });
    });

    if (missingKeys.length > 0) {
      console.error('\n🚨 MISSING TRANSLATION KEYS:');
      console.error('=' .repeat(50));
      
      const byKey = missingKeys.reduce((acc, item) => {
        if (!acc[item.key]) acc[item.key] = [];
        acc[item.key].push(item);
        return acc;
      }, {} as Record<string, typeof missingKeys>);

      Object.entries(byKey).forEach(([key, usages]) => {
        console.error(`\n🔑 Missing key: "${key}"`);
        console.error(`   Used in:`);
        usages.forEach(usage => {
          console.error(`     📄 ${usage.file}:${usage.line}`);
        });
      });

      console.error(`\n💡 SOLUTION: Add missing keys to appropriate translation modules`);
    }

    expect(missingKeys).toEqual([]);
  });

  it('should have consistent language coverage across all translation modules', () => {
    const languages = ['az', 'en', 'ru', 'tr'];
    const modules = ['ui', 'schools', 'dashboard', 'status'];
    const coverage: Record<string, Record<string, boolean>> = {};

    languages.forEach(lang => {
      coverage[lang] = {};
      modules.forEach(module => {
        const modulePath = `src/translations/${lang}/${module}.ts`;
        coverage[lang][module] = fs.existsSync(modulePath);
      });
    });

    const missing: string[] = [];
    Object.entries(coverage).forEach(([lang, modules]) => {
      Object.entries(modules).forEach(([module, exists]) => {
        if (!exists) {
          missing.push(`${lang}/${module}.ts`);
        }
      });
    });

    if (missing.length > 0) {
      console.error('\n🚨 MISSING TRANSLATION FILES:');
      console.error('=' .repeat(50));
      missing.forEach(file => {
        console.error(`   📝 src/translations/${file}`);
      });
      console.error(`\n💡 SOLUTION: Create missing translation files for complete language coverage`);
    }

    expect(missing).toEqual([]);
  });
});

// Helper function to generate translation coverage report
export function generateTranslationReport(): void {
  console.log('\n📊 TRANSLATION COVERAGE REPORT');
  console.log('=' .repeat(50));
  
  const languages = ['az', 'en', 'ru', 'tr'];
  const modules = ['ui', 'schools', 'dashboard', 'status'];
  
  languages.forEach(lang => {
    console.log(`\n🌐 Language: ${lang.toUpperCase()}`);
    modules.forEach(module => {
      const modulePath = `src/translations/${lang}/${module}.ts`;
      if (fs.existsSync(modulePath)) {
        const content = fs.readFileSync(modulePath, 'utf8');
        const keyCount = (content.match(/\w+:/g) || []).length;
        const status = keyCount > 5 ? '✅' : '⚠️';
        console.log(`   ${status} ${module}: ${keyCount} keys`);
      } else {
        console.log(`   ❌ ${module}: Missing`);
      }
    });
  });
  
  console.log('\n🎯 RECOMMENDATIONS:');
  console.log('   1. Ensure all modules have 10+ keys');
  console.log('   2. Replace remaining hardcoded text');
  console.log('   3. Use consistent dot notation format');
  console.log('   4. Add missing translation files');
}

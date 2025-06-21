#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join, basename, extname } from 'path';
import { execSync } from 'child_process';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Polyfill for __dirname in ES modules
const getDirname = (url) => {
  return dirname(fileURLToPath(url));
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m'
  },
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m'
  }
};

// Setup readline interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Find all React components in the src directory
const findComponents = (dir = './src') => {
  const files = [];
  
  const walkSync = (dir) => {
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        try {
          const fullPath = join(dir, entry.name);
          
          if (entry.isDirectory()) {
            walkSync(fullPath);
          } else if (entry.isFile() && 
                    (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx')) &&
                    !entry.name.endsWith('.test.tsx') && 
                    !entry.name.endsWith('.test.jsx') &&
                    !entry.name.endsWith('.stories.tsx') &&
                    !entry.name.endsWith('.stories.jsx') &&
                    !entry.name.match(/^_/)) {
            files.push(fullPath);
          }
        } catch (error) {
          console.error(`Error processing ${entry.name}:`, error.message);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message);
    }
  };
  
  walkSync(dir);
  return files;
};

// Analyze a single component file
const analyzeComponent = (filePath) => {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const result = {
    filePath,
    usesOldTranslation: content.includes('useLanguage') || content.includes('useTranslation'),
    hasHardcodedText: false,
    hardcodedTexts: [],
    translationKeys: [],
    suggestions: []
  };
  
  // Simple regex to find potential hardcoded text in JSX
  const textRegex = />\s*[A-Za-zƏəĞğIıİiÖöŞşÜüÇçĢģĶķŅņŖŗŜŝŢţŴŵŶŷŸŹźŻżŽžƒȘșȚțˆˇ˘˙˚˛˝͵΄΅ΆΈΉΊΌΎΏΐΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩΪΫάέήίΰαβγδεζηθικλμνξοπρςστυφχψωϊϋόύώϐϑϒϓϖϚϜϝϞϠϰϱϲϳϴϵϸϼЀЁЂЃЄЅІЇЈЉЊЋЌЍЎЏАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюяѐђѓєѕіїјљњћќѝўџѠѡѢѣѲѳѴѵҐґҒғҖҗҘҙҚқҢңҪҫҮүҰұҲҳҶҷҺһӀӁӂӃӄӇӈӋӌӐӑӒӓӔӕӖӗӘәӚӛӜӝӞӟӢӣӤӥӦӧӨөӪӫӬӭӮӯӰӱӲӳӴӵӶӷӸӹ]+[^<>{}"']*[A-Za-zƏəĞğIıİiÖöŞşÜüÇçĢģĶķŅņŖŗŜŝŢţŴŵŶŷŸŹźŻżŽžƒȘșȚțˆˇ˘˙˚˛˝͵΄΅ΆΈΉΊΌΎΏΐΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩΪΫάέήίΰαβγδεζηθικλμνξοπρςστυφχψωϊϋόύώϐϑϒϓϖϚϜϝϞϠϰϱϲϳϴϵϸϼЀЁЂЃЄЅІЇЈЉЊЋЌЍЎЏАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюяѐђѓєѕіїјљњћќѝўџѠѡѢѣѲѳѴѵҐґҒғҖҗҘҙҚқҢңҪҫҮүҰұҲҳҶҷҺһӀӁӂӃӄӇӈӋӌӐӑӒӓӔӕӖӗӘәӚӛӜӝӞӟӢӣӤӥӦӧӨөӪӫӬӭӮӯӰӱӲӳӴӵӶӷӸӹ]/;
  
  lines.forEach((line, index) => {
    // Skip comments and JSX attributes
    if (line.trim().startsWith('//') || line.includes('//') || 
        line.includes('className=') || line.includes('style=') ||
        line.includes('aria-') || line.includes('data-') ||
        line.includes('http') || line.includes('@') ||
        line.includes('import ') || line.includes('export ')) {
      return;
    }
    
    // Check for hardcoded text
    const textMatch = line.match(textRegex);
    if (textMatch) {
      const text = textMatch[0].replace(/^>\s*|\s*[<{].*$|^[^{}]*[\s>][\s\S]*$/g, '').trim();
      
      // Skip empty or very short texts, numbers, and common patterns
      if (text && text.length > 2 && 
          !/^\d+$/.test(text) && 
          !/^[.,:;!?\-–—=+*&^%$#@~`|\\/]+$/.test(text) &&
          !/^[A-Z0-9_]+$/.test(text) &&
          !text.startsWith('{') && 
          !text.endsWith('}') &&
          !text.includes('=>') &&
          !text.includes('return') &&
          !text.includes('if (') &&
          !text.includes('} else') &&
          !text.includes('case ') &&
          !text.includes('default:')) {
            
        result.hasHardcodedText = true;
        result.hardcodedTexts.push({
          text,
          line: index + 1,
          lineContent: line.trim()
        });
      }
    }
    
    // Find translation keys
    const translationMatch = line.match(/t\(['"]([^'"]+)['"]/);
    if (translationMatch) {
      const key = translationMatch[1];
      if (!result.translationKeys.includes(key)) {
        result.translationKeys.push(key);
      }
    }
  });
  
  // Generate suggestions
  if (result.usesOldTranslation) {
    result.suggestions.push({
      type: 'import',
      description: 'Replace old translation import with new one',
      oldCode: 'import { useLanguage } from \'@/context/LanguageContext\';',
      newCode: 'import { useTranslation } from \'@/contexts/TranslationContext\';'
    });
    
    result.suggestions.push({
      type: 'hook',
      description: 'Replace useLanguage hook with useTranslation',
      oldCode: 'const { t } = useLanguage();',
      newCode: 'const { t } = useTranslation();'
    });
  }
  
  if (result.hasHardcodedText) {
    result.hardcodedTexts.forEach((item) => {
      // Generate a key suggestion based on the text and file path
      const keySuggestion = generateKeySuggestion(item.text, filePath);
      
      result.suggestions.push({
        type: 'hardcoded',
        description: `Replace hardcoded text with translation key: ${item.text}`,
        oldCode: `>${item.lineContent.match(/>[^<]*/)[0]}`,
        newCode: `>{t('${keySuggestion}')}`,
        line: item.line,
        keySuggestion: keySuggestion
      });
    });
  }
  
  return result;
};

// Generate a suggested translation key based on the text and file path
const generateKeySuggestion = (text, filePath) => {
  // Extract component name from file path
  const fileName = basename(filePath, extname(filePath));
  const componentName = fileName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
  
  // Clean up the text for the key
  let key = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  
  // If text is too long, take first few words
  const words = key.split('_');
  if (words.length > 3) {
    key = words.slice(0, 3).join('_');
  }
  
  return `${componentName}.${key}`;
};

// Format the analysis results
const formatResults = (results) => {
  let output = '';
  
  results.forEach((result) => {
    if (!result.usesOldTranslation && !result.hasHardcodedText) {
      return; // Skip files that don't need changes
    }
    
    output += `\n${colors.fg.cyan}${result.filePath}${colors.reset}\n`;
    output += '='.repeat(result.filePath.length) + '\n\n';
    
    if (result.usesOldTranslation) {
      output += `${colors.fg.yellow}ℹ️  Uses old translation system${colors.reset}\n`;
    }
    
    if (result.hasHardcodedText) {
      output += `${colors.fg.yellow}ℹ️  Contains hardcoded text:${colors.reset}\n`;
      result.hardcodedTexts.forEach((item) => {
        output += `  Line ${item.line}: ${item.text}\n`;
      });
      output += '\n';
    }
    
    if (result.suggestions.length > 0) {
      output += `${colors.fg.green}✅  Suggested changes:${colors.reset}\n`;
      result.suggestions.forEach((suggestion, index) => {
        output += `  ${index + 1}. ${suggestion.description}\n`;
        output += `     ${colors.dim}${suggestion.oldCode || 'N/A'}${colors.reset}\n`;
        output += `     ${colors.fg.green}→ ${suggestion.newCode || 'N/A'}${colors.reset}\n`;
        
        if (suggestion.keySuggestion) {
          output += `     ${colors.fg.blue}Key suggestion: ${suggestion.keySuggestion}${colors.reset}\n`;
        }
        
        output += '\n';
      });
    }
    
    output += '\n';
  });
  
  return output;
};

// Apply suggested changes to a file
const applyChanges = async (filePath, changes) => {
  let content = readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Sort changes by line number in reverse order to avoid offset issues
  const sortedChanges = [...changes]
    .filter(change => change.line)
    .sort((a, b) => b.line - a.line);
  
  // Apply line-based changes
  if (sortedChanges.length > 0) {
    const lines = content.split('\n');
    
    for (const change of sortedChanges) {
      if (change.line && change.line <= lines.length) {
        const lineIndex = change.line - 1;
        const oldLine = lines[lineIndex];
        const newLine = oldLine.replace(change.oldCode, change.newCode);
        
        if (oldLine !== newLine) {
          lines[lineIndex] = newLine;
          modified = true;
        }
      }
    }
    
    if (modified) {
      content = lines.join('\n');
    }
  }
  
  // Apply global replacements
  const globalChanges = changes.filter(change => !change.line);
  
  for (const change of globalChanges) {
    if (content.includes(change.oldCode)) {
      content = content.replace(new RegExp(escapeRegExp(change.oldCode), 'g'), change.newCode);
      modified = true;
    }
  }
  
  if (modified) {
    try {
      // Create backup
      const backupPath = `${filePath}.bak`;
      writeFileSync(backupPath, readFileSync(filePath));
      
      // Write changes
      writeFileSync(filePath, content, 'utf8');
      
      // Format with Prettier
      try {
        execSync(`npx prettier --write "${filePath}"`, { stdio: 'pipe' });
        console.log(`${colors.fg.green}✅  Successfully updated ${filePath}${colors.reset}`);
        console.log(`${colors.dim}   Backup saved to ${backupPath}${colors.reset}\n`);
        return true;
      } catch (error) {
        console.error(`${colors.fg.red}❌  Error formatting ${filePath}:${colors.reset}`, error.message);
        // Revert changes if formatting fails
        writeFileSync(filePath, readFileSync(backupPath));
        unlinkSync(backupPath);
        return false;
      }
    } catch (error) {
      console.error(`${colors.fg.red}❌  Error updating ${filePath}:${colors.reset}`, error.message);
      return false;
    }
  }
  
  console.log(`${colors.dim}ℹ️  No changes needed for ${filePath}${colors.reset}\n`);
  return false;
};

// Helper function to escape special characters in regex
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Main function
const main = async () => {
  console.log(`${colors.bright}🔍  Analyzing components for translation issues...${colors.reset}\n`);
  
  // Find all components
  const componentFiles = findComponents();
  console.log(`Found ${componentFiles.length} components to analyze\n`);
  
  // Analyze components
  const results = [];
  for (const file of componentFiles) {
    try {
      const result = analyzeComponent(file);
      if (result.usesOldTranslation || result.hasHardcodedText) {
        results.push(result);
      }
    } catch (error) {
      console.error(`Error analyzing ${file}:`, error.message);
    }
  }
  
  // Display results
  console.log(formatResults(results));
  
  if (results.length === 0) {
    console.log(`${colors.fg.green}✅  No translation issues found!${colors.reset}`);
    process.exit(0);
  }
  
  // Ask if user wants to apply changes
  const apply = await prompt(`\n${colors.bright}Apply suggested changes? (y/N) ${colors.reset}`);
  
  if (apply.toLowerCase() === 'y') {
    console.log('\nApplying changes...\n');
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const result of results) {
      const fileChanges = result.suggestions || [];
      
      if (fileChanges.length > 0) {
        console.log(`\n${colors.bright}Updating ${result.filePath}...${colors.reset}`);
        
        try {
          const success = await applyChanges(result.filePath, fileChanges);
          
          if (success) {
            successCount++;
          } else {
            failureCount++;
          }
        } catch (error) {
          console.error(`Error updating ${result.filePath}:`, error.message);
          failureCount++;
        }
      }
    }
    
    console.log(`\n${colors.fg.green}✅  Successfully updated ${successCount} files${colors.reset}`);
    
    if (failureCount > 0) {
      console.log(`${colors.fg.yellow}⚠️  Failed to update ${failureCount} files${colors.reset}`);
    }
    
    console.log('\nMigration complete!');
  } else {
    console.log('\nNo changes were applied.');
  }
  
  rl.close();
};

// Run the script
main().catch((error) => {
  console.error('An error occurred:', error);
  process.exit(1);
});

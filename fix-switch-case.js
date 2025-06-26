import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Axtarış pattern və əvəzləmə funksiyası
const searchPattern = /case\s+['"]([^'"]+)['"]\s*:\s*{(.*?)return(.*?);(?!\s*})/g;
const replacement = (match, caseValue, beforeReturn, returnValue) => {
  return `case '${caseValue}': {\n  ${beforeReturn.trim()} return${returnValue};\n}`;
};

// Qovluqları rekursiv şəkildə gəzmək və faylları düzəltmək
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.git')) {
      processDirectory(filePath);
    } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !file.endsWith('.d.ts')) {
      fixFile(filePath);
    }
  });
}

// Faylda switch-case düzəlişləri etmək
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Bütün switch bloklarını tap
    const switchRegex = /switch\s*\([^)]+\)\s*{([^}]+)}/g;
    let hasChanges = false;
    
    content = content.replace(switchRegex, (switchBlock, casesContent) => {
      const fixedCases = casesContent.replace(/case\s+(['"])([^'"]+)\1\s*:\s*{([^}]*?return[^;]*;)(?!\s*})/g, 
        (match, quote, caseValue, returnCode) => {
          hasChanges = true;
          return `case ${quote}${caseValue}${quote}: {\n${returnCode}\n}`;
        });
      
      return `switch (${switchBlock.match(/switch\s*\(([^)]+)\)/)[1]}) {${fixedCases}}`;
    });
    
    // Case-lərin mötərizə bağlanma xətası düzəldilir
    let modifiedContent = content;
    
    // Əgər dəyişiklik varsa, faylı yenilə
    if (content !== originalContent) {
      console.log(`Düzəliş edildi: ${filePath}`);
      fs.writeFileSync(filePath, content, 'utf8');
    }
  } catch (err) {
    console.error(`Xəta: ${filePath}`, err);
  }
}

// Əsas layihə qovluğundan başla
const srcDir = path.resolve(__dirname, 'src');
console.log(`Switch-case sintaksis xətalarını düzəldirik (${srcDir})...`);
processDirectory(srcDir);
console.log('Bitdi!');

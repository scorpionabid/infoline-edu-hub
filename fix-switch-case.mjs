import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Qovluqları rekursiv şəkildə gəzmək və faylları düzəltmək
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.git')) {
      processDirectory(filePath);
    } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !file.endsWith('.d.ts')) {
      fixFile(filePath);
    }
  }
}

// Faylda switch-case düzəlişləri etmək
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // İlk olaraq bütün switch bloklarını tap
    const switchPattern = /switch\s*\([^)]+\)\s*{([^{}]*(?:{[^{}]*}[^{}]*)*)}/gs;
    
    // Hər switch blokunun içərisindəki case ifadələrini düzəlt
    content = content.replace(switchPattern, (switchBlock) => {
      // Switch başlığını və gövdəsini ayır
      const switchHeaderMatch = switchBlock.match(/switch\s*\([^)]+\)\s*{/);
      if (!switchHeaderMatch) return switchBlock;
      
      const switchHeader = switchHeaderMatch[0];
      const switchBody = switchBlock.slice(switchHeader.length, -1); // Son } mötərizəsini çıxar
      
      // Case ifadələrini düzəlt
      const fixedSwitchBody = switchBody.replace(/case\s+(['"])(.*?)\1\s*:\s*{\s*return(.*?);(?!\s*})/g, 
        (match, quote, caseValue, returnValue) => {
          return `case ${quote}${caseValue}${quote}: {\n        return${returnValue};\n      }`;
        });
      
      return `${switchHeader}${fixedSwitchBody}}`;
    });

    // Əgər dəyişikliklər varsa, faylı yenilə
    if (content !== originalContent) {
      console.log(`✅ Düzəldi: ${path.basename(filePath)}`);
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Xəta: ${filePath}`, error);
    return false;
  }
}

// Əsas funksiya
console.log('🔍 Switch-case sintaksis xətalarını düzəldirik...');
const srcDir = path.join(__dirname, 'src');
let totalFixed = 0;

try {
  processDirectory(srcDir);
  console.log(`✨ Bitdi! Düzəlişlər tamamlandı.`);
} catch (error) {
  console.error('❌ Əməliyyat zamanı xəta baş verdi:', error);
}

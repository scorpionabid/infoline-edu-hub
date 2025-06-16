#!/usr/bin/env node

/**
 * Hardcoded mətnləri tapmaq üçün script
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Azərbaycan əlifbasının simvolları
const azerbaijaniChars = /[əğıışçöü]/gi;

// İngilis hardcoded mətnləri tapmaq üçün pattern
const englishTextPattern = /"[A-Z][a-z ]+"/g;
const azerbaijaniTextPattern = /["'][^"']*[əğıışçöü][^"']*["']/gi;

// Excempt ediləcək fayllar və qovluqlar
const excludePatterns = [
  'node_modules/**',
  'dist/**',
  'build/**',
  '*.test.ts',
  '*.test.tsx',
  'translations/**',
  'locales/**',
  '*.json',
  '*.md'
];

// Exemte ediləcək mətn nümunələri
const excludeTexts = [
  'useTranslation',
  'translation',
  't(',
  'import',
  'export',
  'console.log',
  'console.error',
  'className',
  'data-testid',
  'aria-label',
  'placeholder'
];

function findHardcodedTexts(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const results = [];

  lines.forEach((line, index) => {
    // Skip importlar və exportlar
    if (line.trim().startsWith('import') || line.trim().startsWith('export')) {
      return;
    }

    // Skip console.log və digər debug mesajları
    if (line.includes('console.') || line.includes('// ') || line.includes('/* ')) {
      return;
    }

    // Skip əgər artıq useTranslation istifadə edirsi
    if (line.includes('useTranslation') || line.includes('t(')) {
      return;
    }

    // Azərbaycan mətnlərini tap
    const azerbaijaniMatches = line.match(azerbaijaniTextPattern);
    if (azerbaijaniMatches) {
      azerbaijaniMatches.forEach(match => {
        const cleanText = match.replace(/["']/g, '');
        if (cleanText.length > 2 && !excludeTexts.some(exc => cleanText.includes(exc))) {
          results.push({
            file: filePath,
            line: index + 1,
            text: cleanText,
            type: 'azerbaijani',
            context: line.trim(),
            suggestedKey: generateSuggestedKey(cleanText)
          });
        }
      });
    }

    // İngilis mətnlərini tap
    const englishMatches = line.match(englishTextPattern);
    if (englishMatches) {
      englishMatches.forEach(match => {
        const cleanText = match.replace(/["']/g, '');
        if (cleanText.length > 3 && 
            !excludeTexts.some(exc => cleanText.toLowerCase().includes(exc.toLowerCase())) &&
            !line.includes('useTranslation') &&
            cleanText.split(' ').length <= 5) { // Uzun mətnləri skip et
          results.push({
            file: filePath,
            line: index + 1,
            text: cleanText,
            type: 'english',
            context: line.trim(),
            suggestedKey: generateSuggestedKey(cleanText)
          });
        }
      });
    }
  });

  return results;
}

function generateSuggestedKey(text) {
  const cleanText = text.toLowerCase()
    .replace(/[əğıışçöü]/g, (match) => {
      const map = { 'ə': 'e', 'ğ': 'g', 'ı': 'i', 'ş': 's', 'ç': 'c', 'ö': 'o', 'ü': 'u' };
      return map[match] || match;
    })
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  // Module əsasında key generate et
  if (text.toLowerCase().includes('user') || text.toLowerCase().includes('istifadəçi')) {
    return `userManagement.${cleanText}`;
  } else if (text.toLowerCase().includes('school') || text.toLowerCase().includes('məktəb')) {
    return `schools.${cleanText}`;
  } else if (text.toLowerCase().includes('dashboard') || text.toLowerCase().includes('panel')) {
    return `dashboard.${cleanText}`;
  } else {
    return `core.${cleanText}`;
  }
}

function scanDirectory(directory) {
  const pattern = path.join(directory, '**/*.{ts,tsx,js,jsx}');
  const files = glob.sync(pattern, { ignore: excludePatterns });
  
  let allResults = [];
  
  files.forEach(file => {
    const results = findHardcodedTexts(file);
    allResults = allResults.concat(results);
  });
  
  return allResults;
}

function generateReport(results) {
  const report = {
    summary: {
      totalFiles: new Set(results.map(r => r.file)).size,
      totalHardcodedTexts: results.length,
      azerbaijaniTexts: results.filter(r => r.type === 'azerbaijani').length,
      englishTexts: results.filter(r => r.type === 'english').length
    },
    byFile: {},
    suggestions: []
  };

  // Fayl üzrə qruplaşdır
  results.forEach(result => {
    if (!report.byFile[result.file]) {
      report.byFile[result.file] = [];
    }
    report.byFile[result.file].push(result);
  });

  // Suggestions generate et
  results.forEach(result => {
    report.suggestions.push({
      original: result.text,
      suggestedKey: result.suggestedKey,
      replacement: `{t('${result.suggestedKey}')}`,
      file: result.file,
      line: result.line
    });
  });

  return report;
}

function main() {
  console.log('🔍 İnfoLine - Hardcoded mətnləri axtarır...\n');
  
  const sourceDir = process.argv[2] || './src';
  const outputFile = process.argv[3] || './analysis/hardcoded-texts.json';
  
  if (!fs.existsSync(sourceDir)) {
    console.error(`❌ Qovluq tapılmadı: ${sourceDir}`);
    process.exit(1);
  }

  // Analysis qovluğunu yarat
  const analysisDir = path.dirname(outputFile);
  if (!fs.existsSync(analysisDir)) {
    fs.mkdirSync(analysisDir, { recursive: true });
  }

  const results = scanDirectory(sourceDir);
  const report = generateReport(results);

  // Nəticələri JSON faylına yaz
  fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));

  // Konsola xülasə çap et
  console.log('📊 HARDCODED MƏTN ANALİZİ');
  console.log('================================');
  console.log(`📁 Yoxlanılan fayllar: ${report.summary.totalFiles}`);
  console.log(`📝 Ümumi hardcoded mətnlər: ${report.summary.totalHardcodedTexts}`);
  console.log(`🇦🇿 Azərbaycan mətnləri: ${report.summary.azerbaijaniTexts}`);
  console.log(`🇺🇸 İngilis mətnləri: ${report.summary.englishTexts}`);
  console.log(`\n📄 Detallı hesabat: ${outputFile}`);

  if (report.summary.totalHardcodedTexts > 0) {
    console.log('\n🔥 ƏN ÇOXU OLAN FAYLLAR:');
    console.log('========================');
    
    const filesSorted = Object.entries(report.byFile)
      .sort(([,a], [,b]) => b.length - a.length)
      .slice(0, 10);
    
    filesSorted.forEach(([file, texts]) => {
      const relativePath = path.relative(process.cwd(), file);
      console.log(`${texts.length.toString().padStart(3)} mətn - ${relativePath}`);
    });

    console.log('\n💡 İLK 5 TƏKLİF:');
    console.log('==================');
    report.suggestions.slice(0, 5).forEach((suggestion, index) => {
      console.log(`${index + 1}. "${suggestion.original}"`);
      console.log(`   Key: ${suggestion.suggestedKey}`);
      console.log(`   Fayl: ${path.relative(process.cwd(), suggestion.file)}:${suggestion.line}\n`);
    });
  }

  console.log(`\n✅ Analiz tamamlandı! ${outputFile} faylını yoxlayın.`);
  
  return report.summary.totalHardcodedTexts;
}

module.exports = { findHardcodedTexts, scanDirectory, generateReport };

if (require.main === module) {
  const hardcodedCount = main();
  process.exit(hardcodedCount > 0 ? 1 : 0);
}
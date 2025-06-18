#!/usr/bin/env node

/**
 * İnfoLine Translation Analysis Script
 * Bütün hardcoded mətnləri müəyyənləşdirir və translation keys yaradır
 */

const fs = require('fs');
const path = require('path');

// Analiz ediləcək file extensions
const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

// Translation işarələri
const TRANSLATION_PATTERNS = [
  /['"`]([A-ZÇƏĞIİÖŞÜa-zçəğıiöşü\s]{3,})["`']/g,  // Azərbaycan mətnləri
  /placeholder\s*=\s*['"`]([^'"`]+)['"`]/g,           // Placeholder texts
  /title\s*=\s*['"`]([^'"`]+)['"`]/g,                 // Title attributes  
  /aria-label\s*=\s*['"`]([^'"`]+)['"`]/g,           // Aria labels
];

// İstisna ediləcək path-lər
const EXCLUDE_PATHS = [
  'node_modules',
  '.git', 
  'dist',
  'build',
  '__tests__',
  '.test.',
  '.spec.',
  'scripts'
];

// İstisna ediləcək mətnlər
const EXCLUDE_TEXTS = [
  'id', 'email', 'password', 'uuid', 'admin', 'url', 'api', 'http', 'https',
  'true', 'false', 'null', 'undefined', 'console', 'log', 'error', 'warn',
  'px', 'rem', 'em', '%', 'vh', 'vw', 'auto', 'none', 'block', 'flex',
  'grid', 'inline', 'hidden', 'visible', 'absolute', 'relative', 'fixed'
];

class TranslationAnalyzer {
  constructor() {
    this.hardcodedTexts = new Map();
    this.processedFiles = 0;
    this.totalHardcodedCount = 0;
  }

  shouldExcludeFile(filePath) {
    return EXCLUDE_PATHS.some(excludePath => 
      filePath.includes(excludePath)
    );
  }

  shouldExcludeText(text) {
    const cleanText = text.trim().toLowerCase();
    
    // Çox qısa və ya uzun mətnlər
    if (cleanText.length < 3 || cleanText.length > 100) return true;
    
    // CSS class/style patterns
    if (/^[a-z-]+$/.test(cleanText)) return true;
    
    // Rəqəm və special karakterlər
    if (/^[0-9\s\-_./:@#$%^&*()+={}[\]|\\]+$/.test(cleanText)) return true;
    
    // İstisna siyahısında olan mətnlər
    if (EXCLUDE_TEXTS.includes(cleanText)) return true;
    
    // HTML tag names
    if (/^[a-z]+$/.test(cleanText) && cleanText.length < 8) return true;
    
    return false;
  }

  extractHardcodedTexts(content, filePath) {
    const results = [];
    
    TRANSLATION_PATTERNS.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const text = match[1];
        
        if (!this.shouldExcludeText(text)) {
          results.push({
            text,
            line: content.substring(0, match.index).split('\n').length,
            pattern: pattern.source
          });
        }
      }
    });
    
    return results;
  }

  generateTranslationKey(text, context) {
    // Azərbaycan mətnindən translation key yaradır
    let key = text
      .toLowerCase()
      .replace(/[çə]/g, 'c')
      .replace(/[ğ]/g, 'g') 
      .replace(/[ı]/g, 'i')
      .replace(/[iİ]/g, 'i')
      .replace(/[ö]/g, 'o')
      .replace(/[ş]/g, 's')
      .replace(/[ü]/g, 'u')
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    // Context əlavə et
    if (context) {
      key = `${context}_${key}`;
    }
    
    return key;
  }

  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const hardcodedTexts = this.extractHardcodedTexts(content, filePath);
      
      if (hardcodedTexts.length > 0) {
        this.hardcodedTexts.set(filePath, hardcodedTexts);
        this.totalHardcodedCount += hardcodedTexts.length;
      }
      
      this.processedFiles++;
    } catch (error) {
      console.error(`Xəta: ${filePath} - ${error.message}`);
    }
  }

  scanDirectory(dirPath) {
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!this.shouldExcludeFile(fullPath)) {
            this.scanDirectory(fullPath);
          }
        } else if (stat.isFile()) {
          const ext = path.extname(fullPath);
          if (EXTENSIONS.includes(ext) && !this.shouldExcludeFile(fullPath)) {
            this.analyzeFile(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Directory scan error: ${dirPath} - ${error.message}`);
    }
  }

  generateReport() {
    const report = {
      summary: {
        processedFiles: this.processedFiles,
        filesWithHardcodedTexts: this.hardcodedTexts.size,
        totalHardcodedTexts: this.totalHardcodedCount,
        timestamp: new Date().toISOString()
      },
      files: {}
    };

    // File-by-file analiz
    for (const [filePath, texts] of this.hardcodedTexts) {
      const context = this.getFileContext(filePath);
      
      report.files[filePath] = {
        count: texts.length,
        context,
        texts: texts.map(item => ({
          text: item.text,
          line: item.line,
          suggested_key: this.generateTranslationKey(item.text, context),
          category: this.categorizeText(item.text)
        }))
      };
    }

    return report;
  }

  getFileContext(filePath) {
    const segments = filePath.split(path.sep);
    
    if (segments.includes('components')) {
      const componentIndex = segments.indexOf('components');
      return segments[componentIndex + 1] || 'component';
    }
    
    if (segments.includes('pages')) {
      const pageIndex = segments.indexOf('pages');
      return segments[pageIndex + 1]?.replace('.tsx', '') || 'page';
    }
    
    return 'general';
  }

  categorizeText(text) {
    const lower = text.toLowerCase();
    
    if (lower.includes('xəta') || lower.includes('error')) return 'error';
    if (lower.includes('uğur') || lower.includes('success')) return 'success';
    if (lower.includes('yüklə') || lower.includes('load')) return 'loading';
    if (lower.includes('daxil') || lower.includes('enter')) return 'input';
    if (lower.includes('yadda') || lower.includes('save')) return 'action';
    
    return 'general';
  }

  run(srcPath) {
    console.log('🔍 İnfoLine Translation Analysis başladı...\n');
    
    this.scanDirectory(srcPath);
    const report = this.generateReport();
    
    // Report JSON faylına yazılır
    const reportPath = path.join(__dirname, '..', 'translation-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Console report
    console.log('📊 ANALİZ NƏTİCƏLƏRİ:');
    console.log(`   📁 Analiz edilən fayllar: ${report.summary.processedFiles}`);
    console.log(`   🔤 Hardcoded mətn olan fayllar: ${report.summary.filesWithHardcodedTexts}`);
    console.log(`   📝 Ümumi hardcoded mətn sayı: ${report.summary.totalHardcodedTexts}`);
    console.log(`\n📄 Ətraflı hesabat: ${reportPath}`);
    
    // Ən çox mətn olan fayllar
    console.log('\n🔥 TOP 10 FİLE (ən çox hardcoded mətn):');
    const sortedFiles = Object.entries(report.files)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 10);
      
    sortedFiles.forEach(([file, data], index) => {
      const shortPath = file.replace(srcPath, '');
      console.log(`   ${index + 1}. ${shortPath} (${data.count} mətn)`);
    });
    
    return report;
  }
}

// Script işə salınır
if (require.main === module) {
  const srcPath = path.join(__dirname, '..', 'src');
  const analyzer = new TranslationAnalyzer();
  analyzer.run(srcPath);
}

module.exports = TranslationAnalyzer;

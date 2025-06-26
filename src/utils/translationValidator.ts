import type { 
  TranslationValidationResult, 
  TranslationCoverage,
  SupportedLanguage,
  LanguageTranslations 
} from '@/types/translation';
import { getTranslations } from '@/translations';

/**
 * Translation Validation System
 * 
 * Bu sistem translation coverage və keyfiyyətini yoxlamaq üçün istifadə olunur
 */
export class TranslationValidator {
  private static cache: Map<string, TranslationValidationResult> = new Map();

  /**
   * Bir modulun translation completeness-ini yoxlayır
   */
  static async validateModule(
    module: string, 
    language: SupportedLanguage = 'az'
  ): Promise<TranslationValidationResult> {
    const cacheKey = `${module}-${language}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const azTranslations = await getTranslations('az');
      const targetTranslations = language === 'az' ? 
        azTranslations : 
        await getTranslations(language);

      const azModule = azTranslations[module as keyof LanguageTranslations];
      const targetModule = targetTranslations[module as keyof LanguageTranslations];

      const result = this.compareModules(azModule, targetModule, module);
      
      // Cache result for 5 minutes
      this.cache.set(cacheKey, result);
      setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);
      
      return result;
    } catch (error) {
      console.error(`Translation validation error for ${module}:`, error);
      return {
        valid: false,
        missingKeys: [],
        invalidKeys: [],
        coverage: 0
      };
    }
  }

  /**
   * Bütün modulları validate edir
   */
  static async validateAllModules(
    language: SupportedLanguage = 'az'
  ): Promise<TranslationCoverage> {
    const modules = [
      'auth', 'categories', 'core', 'dashboard', 'dataEntry',
      'feedback', 'general', 'navigation', 'notifications',
      'organization', 'profile', 'schools', 'status', 'time',
      'ui', 'user', 'userManagement', 'validation'
    ];

    const coverage: TranslationCoverage = {};

    for (const module of modules) {
      try {
        const result = await this.validateModule(module, language);
        coverage[module] = {
          completed: result.valid,
          percentage: result.coverage || 0,
          missingKeys: result.missingKeys,
          totalKeys: this.countKeys(result)
        };
      } catch (error) {
        console.error(`Error validating module ${module}:`, error);
        coverage[module] = {
          completed: false,
          percentage: 0,
          missingKeys: [],
          totalKeys: 0
        };
      }
    }

    return coverage;
  }

  /**
   * İki modulun müqayisəsi
   */
  private static compareModules(
    sourceModule: any,
    targetModule: any,
    moduleName: string
  ): TranslationValidationResult {
    const missingKeys: string[] = [];
    const invalidKeys: string[] = [];
    
    const sourceKeys = this.flattenObject(sourceModule);
    const targetKeys = this.flattenObject(targetModule);
    
    const totalKeys = Object.keys(sourceKeys).length;
    let validKeys = 0;

    // Check for missing keys
    for (const key of Object.keys(sourceKeys)) {
      if (!(key in targetKeys)) {
        missingKeys.push(`${moduleName}.${key}`);
      } else if (targetKeys[key] === sourceKeys[key] && moduleName !== 'az') {
        // Key exists but value is the same (not translated)
        invalidKeys.push(`${moduleName}.${key}`);
      } else {
        validKeys++;
      }
    }

    const coverage = totalKeys > 0 ? Math.round((validKeys / totalKeys) * 100) : 0;

    return {
      valid: missingKeys.length === 0 && invalidKeys.length === 0,
      missingKeys,
      invalidKeys,
      coverage
    };
  }

  /**
   * Nested object-i flatten edir
   */
  private static flattenObject(
    obj: any, 
    prefix: string = ''
  ): Record<string, string> {
    const flattened: Record<string, string> = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          Object.assign(flattened, this.flattenObject(obj[key], newKey));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }

    return flattened;
  }

  /**
   * Açarların sayını hesablayır
   */
  private static countKeys(result: TranslationValidationResult): number {
    return result.missingKeys.length + 
           result.invalidKeys.length + 
           Math.round((result.coverage || 0) / 100 * 
           (result.missingKeys.length + result.invalidKeys.length));
  }

  /**
   * Console-da report çap edir
   */
  static async generateConsoleReport(language: SupportedLanguage = 'az'): Promise<void> {
    console.log(`\n🌐 TRANSLATION COVERAGE REPORT - ${language.toUpperCase()}`);
    console.log('='.repeat(50));

    const coverage = await this.validateAllModules(language);
    
    const sortedModules = Object.entries(coverage)
      .sort(([,a], [,b]) => b.percentage - a.percentage);

    let totalKeys = 0;
    let totalMissing = 0;

    sortedModules.forEach(([module, data]) => {
      const status = data.completed ? '✅' : '❌';
      const percentage = `${data.percentage}%`.padStart(4);
      const missing = data.missingKeys?.length || 0;
      
      console.log(`${status} ${module.padEnd(15)} ${percentage} (${missing} missing)`);
      
      totalKeys += data.totalKeys || 0;
      totalMissing += missing;
    });

    const overallPercentage = totalKeys > 0 ? 
      Math.round(((totalKeys - totalMissing) / totalKeys) * 100) : 0;

    console.log('\n📊 OVERALL STATISTICS');
    console.log('-'.repeat(25));
    console.log(`Total modules: ${sortedModules.length}`);
    console.log(`Total keys: ${totalKeys}`);
    console.log(`Missing keys: ${totalMissing}`);
    console.log(`Overall coverage: ${overallPercentage}%`);

    // Show worst performing modules
    const worstModules = sortedModules
      .filter(([,data]) => data.percentage < 80)
      .slice(0, 5);

    if (worstModules.length > 0) {
      console.log('\n🔥 MODULES NEEDING ATTENTION');
      console.log('-'.repeat(30));
      worstModules.forEach(([module, data]) => {
        console.log(`${module}: ${data.percentage}% (${data.missingKeys?.length || 0} missing)`);
      });
    }
  }

  /**
   * HTML report yaradır
   */
  static async generateHTMLReport(language: SupportedLanguage = 'az'): Promise<string> {
    const coverage = await this.validateAllModules(language);
    
    const html = `
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>İnfoLine Translation Coverage Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .module { margin-bottom: 20px; padding: 15px; border-radius: 8px; }
        .completed { background-color: #e8f5e8; border-left: 4px solid #4caf50; }
        .incomplete { background-color: #ffeaa7; border-left: 4px solid #f39c12; }
        .critical { background-color: #ffebee; border-left: 4px solid #f44336; }
        .percentage { font-size: 24px; font-weight: bold; }
        .missing-keys { margin-top: 10px; font-size: 12px; color: #666; }
        .summary { background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🌐 İnfoLine Translation Coverage Report</h1>
        <h2>Language: ${language.toUpperCase()}</h2>
        <p>Generated: ${new Date().toLocaleString()}</p>
      </div>

      <div class="summary">
        <h3>📊 Summary</h3>
        <p><strong>Total Modules:</strong> ${Object.keys(coverage).length}</p>
        <p><strong>Completed Modules:</strong> ${Object.values(coverage).filter(m => m.completed).length}</p>
        <p><strong>Overall Coverage:</strong> ${Math.round(Object.values(coverage).reduce((acc, m) => acc + m.percentage, 0) / Object.keys(coverage).length)}%</p>
      </div>

      ${Object.entries(coverage)
        .sort(([,a], [,b]) => b.percentage - a.percentage)
        .map(([module, data]) => {
          const cssClass = data.percentage >= 90 ? 'completed' : 
                          data.percentage >= 70 ? 'incomplete' : 'critical';
          return `
            <div class="module ${cssClass}">
              <h3>${module}</h3>
              <div class="percentage">${data.percentage}%</div>
              <p><strong>Status:</strong> ${data.completed ? 'Completed' : 'Incomplete'}</p>
              <p><strong>Total Keys:</strong> ${data.totalKeys || 0}</p>
              <p><strong>Missing Keys:</strong> ${data.missingKeys?.length || 0}</p>
              ${data.missingKeys && data.missingKeys.length > 0 ? `
                <div class="missing-keys">
                  <strong>Missing:</strong> ${data.missingKeys.slice(0, 10).join(', ')}
                  ${data.missingKeys.length > 10 ? `... (+${data.missingKeys.length - 10} more)` : ''}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
    </body>
    </html>`;

    return html;
  }

  /**
   * Missing keys üçün auto-fix təklifləri
   */
  static async generateAutoFixSuggestions(
    module: string,
    language: SupportedLanguage = 'az'
  ): Promise<Record<string, string>> {
    const result = await this.validateModule(module, language);
    const suggestions: Record<string, string> = {};

    result.missingKeys.forEach(key => {
      // Generate suggestion based on key name
      const keyParts = key.split('.');
      const lastPart = keyParts[keyParts.length - 1];
      
      // Convert camelCase or snake_case to readable text
      const readable = lastPart
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .toLowerCase()
        .trim();
      
      suggestions[key] = this.capitalizeFirst(readable);
    });

    return suggestions;
  }

  private static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Cache-i təmizləyir
   */
  static clearCache(): void {
    this.cache.clear();
  }
}

export default TranslationValidator;
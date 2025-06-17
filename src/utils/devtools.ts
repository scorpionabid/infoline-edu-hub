
/**
 * Development araçları və debugging utilləri
 */

interface TranslationDebugInfo {
  language: string;
  loadedModules: string[];
  missingKeys: string[];
  cacheInfo: any;
}

export class DevTools {
  private static missingKeys = new Set<string>();
  
  static logTranslationMissing(key: string, language: string) {
    if (process.env.NODE_ENV === 'development') {
      const keyString = `${language}:${key}`;
      if (!this.missingKeys.has(keyString)) {
        this.missingKeys.add(keyString);
        console.group(`🔍 Translation Missing`);
        console.log(`Key: ${key}`);
        console.log(`Language: ${language}`);
        console.log(`Total missing: ${this.missingKeys.size}`);
        console.groupEnd();
      }
    }
  }
  
  static getTranslationDebugInfo(): TranslationDebugInfo {
    return {
      language: localStorage.getItem('preferredLanguage') || 'az',
      loadedModules: [],
      missingKeys: Array.from(this.missingKeys),
      cacheInfo: {}
    };
  }
  
  static clearTranslationLogs() {
    this.missingKeys.clear();
    console.clear();
  }
  
  // Performance monitoring
  static startTimer(label: string): () => number {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      if (process.env.NODE_ENV === 'development') {
        console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
      }
      return duration;
    };
  }
}

// Global debugging interface
if (process.env.NODE_ENV === 'development') {
  (window as any).InfoLineDevTools = DevTools;
}

export default DevTools;

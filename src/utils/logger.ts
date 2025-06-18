/**
 * Production-ready console logging utility
 * Automatically disables verbose logging in production builds
 */

const isDevelopment = import.meta.env.MODE === 'development';
const isDebug = localStorage.getItem('debug') === 'true';

export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDevelopment || isDebug) {
      console.log(`ℹ️ [InfoLine] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    console.warn(`⚠️ [InfoLine] ${message}`, ...args);
  },
  
  error: (message: string, ...args: any[]) => {
    console.error(`❌ [InfoLine] ${message}`, ...args);
  },
  
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment && isDebug) {
      console.debug(`🐛 [InfoLine Debug] ${message}`, ...args);
    }
  },
  
  dashboard: (message: string, data: any) => {
    if (isDevelopment) {
      console.log(`📊 [Dashboard] ${message}`, data);
    }
  },
  
  cache: (message: string, ...args: any[]) => {
    if (isDevelopment && isDebug) {
      console.log(`💾 [Cache] ${message}`, ...args);
    }
  }
};

// Production console cleanup
if (!isDevelopment) {
  // Override console methods in production to reduce noise
  const originalLog = console.log;
  console.log = (...args: any[]) => {
    // Only show important logs in production
    if (args[0]?.includes?.('[InfoLine]') || args[0]?.includes?.('🛠️')) {
      originalLog(...args);
    }
  };
}

export default logger;

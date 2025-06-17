
/**
 * Production utilities for security and performance
 */

import { ENV } from '@/config/environment';

// Remove debug information in production
export const stripDebugInfo = (data: any): any => {
  if (ENV.app.environment === 'production') {
    // Remove debug fields
    const cleaned = { ...data };
    delete cleaned.debug;
    delete cleaned._debug;
    delete cleaned.__debug;
    return cleaned;
  }
  return data;
};

// Secure console logging
export const secureConsole = {
  log: (...args: any[]) => {
    if (ENV.features.enableDebugMode) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (ENV.features.enableDebugMode) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors, but sanitize in production
    if (ENV.app.environment === 'production') {
      console.error('Production error occurred. Check monitoring dashboard.');
    } else {
      console.error(...args);
    }
  }
};

// Production-safe error reporting
export const reportError = (error: Error, context?: string): void => {
  if (ENV.app.environment === 'production') {
    // In production, send to monitoring service
    // For now, just log without sensitive info
    console.error('Error:', error.message, 'Context:', context);
  } else {
    console.error('Error:', error, 'Context:', context);
  }
};

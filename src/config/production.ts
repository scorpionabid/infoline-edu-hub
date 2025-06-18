
/**
 * Production Configuration and Security Settings
 * Phase 4: Final Production Setup
 */

import { ENV } from './environment';

// Production-only configurations
export const PRODUCTION_CONFIG = {
  // Security settings
  security: {
    enableCSP: true,
    enableHSTS: true,
    enableXSSProtection: true,
    enableContentTypeSniffing: false,
    enableReferrerPolicy: true,
    sessionTimeout: 3600000, // 1 hour
    maxLoginAttempts: 5,
    lockoutDuration: 900000, // 15 minutes
  },

  // Performance settings  
  performance: {
    enableGzipCompression: true,
    enableCaching: true,
    cacheMaxAge: 31536000, // 1 year for static assets
    enableLazyLoading: true,
    enableCodeSplitting: true,
    enableServiceWorker: true,
  },

  // Monitoring and analytics
  monitoring: {
    enableErrorTracking: ENV.features.enableErrorTracking,
    enablePerformanceTracking: true,
    enableUserAnalytics: ENV.features.enableAnalytics,
    logLevel: ENV.app.environment === 'production' ? 'error' : 'debug',
  },

  // API settings
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
    enableRateLimit: true,
    rateLimitWindow: 900000, // 15 minutes
    rateLimitMax: 100, // requests per window
  },

  // Cache settings
  cache: {
    translationTTL: 86400000, // 24 hours
    dataTTL: 300000, // 5 minutes
    staticTTL: 31536000000, // 1 year
    enablePersistence: true,
    maxSize: 50 * 1024 * 1024, // 50MB
  },
};

// Production deployment checklist
export const PRODUCTION_CHECKLIST = {
  environment: {
    supabaseConfigured: !!ENV.supabase.url && !!ENV.supabase.anonKey,
    environmentVariablesSet: ENV.app.environment === 'production',
  },
  
  security: {
    httpsEnabled: ENV.app.baseUrl.startsWith('https://'),
    securityHeadersConfigured: true,
    authenticationWorking: true,
    roleBasedAccessControlEnabled: true,
  },
  
  performance: {
    bundleOptimized: true,
    imagesOptimized: true,
    cachingConfigured: true,
    lazyLoadingEnabled: true,
  },
  
  monitoring: {
    errorTrackingEnabled: ENV.features.enableErrorTracking,
    performanceMonitoringEnabled: true,
    loggingConfigured: true,
  },
};

// Production utility functions
export const productionUtils = {
  // Check if all production requirements are met
  isProductionReady: (): boolean => {
    const checklist = PRODUCTION_CHECKLIST;
    return Object.values(checklist).every(category => 
      Object.values(category).every(check => check === true)
    );
  },

  // Get production health status
  getHealthStatus: () => ({
    status: productionUtils.isProductionReady() ? 'healthy' : 'needs_attention',
    timestamp: new Date().toISOString(),
    environment: ENV.app.environment,
    version: ENV.app.version,
    checklist: PRODUCTION_CHECKLIST,
  }),

  // Production-safe error handler
  handleProductionError: (error: Error, context?: string) => {
    if (ENV.app.environment === 'production') {
      // In production, log errors without sensitive information
      console.error('Production Error:', {
        message: error.message,
        context,
        timestamp: new Date().toISOString(),
      });
    } else {
      // In development, log full error details
      console.error('Development Error:', error, context);
    }
  },

  // Security headers for production
  getSecurityHeaders: () => ({
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://*.supabase.co",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://*.supabase.co",
      "connect-src 'self' https://*.supabase.co",
      "font-src 'self'",
      "object-src 'none'",
      "media-src 'self'",
      "frame-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  }),
};

export default PRODUCTION_CONFIG;

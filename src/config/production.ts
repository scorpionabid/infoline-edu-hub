/**
 * Production Environment Configuration
 * Bu fayl production deployment üçün mühüm konfiqurasiya parametrlərini təyin edir
 */

interface ProductionConfig {
  supabase: {
    url: string;
    anonKey: string;
    projectRef: string;
  };
  app: {
    name: string;
    version: string;
    environment: 'production';
    baseUrl: string;
  };
  features: {
    enableAnalytics: boolean;
    enableErrorTracking: boolean;
    enablePerformanceMonitoring: boolean;
    maxFileUploadSize: number; // MB
    sessionTimeout: number; // minutes
  };
  limits: {
    maxUsersPerRegion: number;
    maxSchoolsPerSector: number;
    maxCategoriesPerSystem: number;
  };
  monitoring: {
    enableLogs: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    enableMetrics: boolean;
  };
}

// Production konfiqurasiyası
// Bu dəyərlər production deployment zamanı yenilənməlidir
export const PRODUCTION_CONFIG: ProductionConfig = {
  supabase: {
    // ⚠️ Production deployment zamanı bu dəyərlər yenilənməlidir
    url: process.env.VITE_SUPABASE_URL || 'https://olbfnauhzpdskqnxtwav.supabase.co',
    anonKey: process.env.VITE_SUPABASE_ANON_KEY || '',
    projectRef: 'olbfnauhzpdskqnxtwav', // Production project ID
  },
  
  app: {
    name: 'İnfoLine - Məktəb Məlumatları Toplama Sistemi',
    version: '1.0.0',
    environment: 'production',
    baseUrl: process.env.VITE_BASE_URL || 'https://infoline.edu.az', // Final production URL
  },
  
  features: {
    enableAnalytics: true,
    enableErrorTracking: true,
    enablePerformanceMonitoring: true,
    maxFileUploadSize: 50, // 50MB
    sessionTimeout: 480, // 8 hours
  },
  
  limits: {
    maxUsersPerRegion: 1000,
    maxSchoolsPerSector: 200,
    maxCategoriesPerSystem: 100,
  },
  
  monitoring: {
    enableLogs: true,
    logLevel: 'error', // Production-da yalnız error logları
    enableMetrics: true,
  },
};

// Production deployment validation
export const validateProductionConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Supabase konfiqurasiyası yoxlanışı
  if (!PRODUCTION_CONFIG.supabase.url) {
    errors.push('VITE_SUPABASE_URL mühit dəyişəni təyin edilməyib');
  }
  
  if (!PRODUCTION_CONFIG.supabase.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY mühit dəyişəni təyin edilməyib');
  }
  
  // URL formatı yoxlanışı
  try {
    new URL(PRODUCTION_CONFIG.supabase.url);
  } catch {
    errors.push('SUPABASE_URL düzgün URL formatında deyil');
  }
  
  try {
    new URL(PRODUCTION_CONFIG.app.baseUrl);
  } catch {
    errors.push('Base URL düzgün formatda deyil');
  }
  
  // Anon key formatı yoxlanışı (JWT format)
  if (PRODUCTION_CONFIG.supabase.anonKey && !PRODUCTION_CONFIG.supabase.anonKey.startsWith('eyJ')) {
    errors.push('Supabase anon key JWT formatında deyil');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Performance konfiqurasiyası
export const PERFORMANCE_CONFIG = {
  // Cache strategiyası
  cache: {
    apiCacheTTL: 5 * 60 * 1000, // 5 dəqiqə
    staticAssetsCacheTTL: 7 * 24 * 60 * 60 * 1000, // 7 gün
    userDataCacheTTL: 15 * 60 * 1000, // 15 dəqiqə
  },
  
  // Lazy loading konfiqurasiyası
  lazyLoading: {
    imageIntersectionThreshold: 0.1,
    componentPreloadDistance: 200, // px
  },
  
  // Bundle splitting
  bundleSplitting: {
    maxChunkSize: 500000, // 500KB
    minChunkSize: 20000,  // 20KB
  },
};

// Təhlükəsizlik konfiqurasiyası
export const SECURITY_CONFIG = {
  // JWT token konfiqurasiyası
  auth: {
    tokenRefreshThreshold: 5 * 60, // 5 dəqiqə əvvəl refresh et
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 dəqiqə
  },
  
  // Rate limiting
  rateLimiting: {
    apiRequestsPerMinute: 60,
    fileUploadPerMinute: 10,
    loginAttemptsPerMinute: 5,
  },
  
  // Content Security Policy
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://olbfnauhzpdskqnxtwav.supabase.co"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https://olbfnauhzpdskqnxtwav.supabase.co"],
    connectSrc: ["'self'", "https://olbfnauhzpdskqnxtwav.supabase.co"],
  },
};

// Error tracking konfiqurasiyası
export const ERROR_TRACKING_CONFIG = {
  // Sentry və ya başqa error tracking service üçün
  dsn: process.env.VITE_SENTRY_DSN || '',
  environment: 'production',
  tracesSampleRate: 0.1, // 10% trace sampling
  
  // İstisna ediləcək xətalar
  ignoredErrors: [
    'Network request failed',
    'Failed to fetch',
    'ChunkLoadError',
    'Loading chunk',
  ],
  
  // User context
  enableUserContext: true,
  enablePerformanceMonitoring: true,
};

// Analytics konfiqurasiyası
export const ANALYTICS_CONFIG = {
  // Google Analytics və ya alternativ
  trackingId: process.env.VITE_GA_TRACKING_ID || '',
  
  // Izlənəcək hadisələr
  events: {
    userLogin: 'user_login',
    dataEntry: 'data_entry_submit',
    formApproval: 'form_approval',
    fileUpload: 'file_upload',
    reportGeneration: 'report_generation',
  },
  
  // Privacy settings
  anonymizeIp: true,
  enableAdvertisingFeatures: false,
  cookieExpiration: 365, // days
};

// Default export
export default PRODUCTION_CONFIG;

// Runtime environment check
if (typeof window !== 'undefined') {
  const validation = validateProductionConfig();
  if (!validation.isValid) {
    console.error('Production Configuration Errors:', validation.errors);
    
    // Production-da xəta varsa bildiriş göstər
    if (PRODUCTION_CONFIG.monitoring.enableLogs) {
      validation.errors.forEach(error => console.error('[CONFIG ERROR]:', error));
    }
  }
}

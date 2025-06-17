
/**
 * Security Configuration for İnfoLine
 * Centralized security settings and validation
 */

// Rate limiting configuration
export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: {
    max: 5,
    windowMinutes: 15,
  },
  API_REQUESTS: {
    max: 60,
    windowMinutes: 1,
  },
  FILE_UPLOADS: {
    max: 10,
    windowMinutes: 5,
  },
} as const;

// File upload security
export const FILE_UPLOAD_SECURITY = {
  maxSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/csv',
  ] as const,
  allowedExtensions: ['.pdf', '.xlsx', '.xls', '.jpg', '.jpeg', '.png', '.gif', '.csv'] as const,
} as const;

// Input validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  NAME: /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0400-\u04FF\s\-'\.]{2,50}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

// XSS prevention
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/onload=/gi, '')
    .replace(/onerror=/gi, '')
    .replace(/onclick=/gi, '')
    .replace(/onmouseover=/gi, '')
    .trim();
};

// Validate file upload
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  if (file.size > FILE_UPLOAD_SECURITY.maxSize) {
    return { valid: false, error: 'File size exceeds 50MB limit' };
  }
  
  if (!FILE_UPLOAD_SECURITY.allowedTypes.includes(file.type as any)) {
    return { valid: false, error: 'File type not allowed' };
  }
  
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!FILE_UPLOAD_SECURITY.allowedExtensions.includes(extension as any)) {
    return { valid: false, error: 'File extension not allowed' };
  }
  
  return { valid: true };
};

// Input validation
export const validateInput = {
  email: (email: string): boolean => VALIDATION_PATTERNS.EMAIL.test(email),
  phone: (phone: string): boolean => !phone || VALIDATION_PATTERNS.PHONE.test(phone),
  name: (name: string): boolean => VALIDATION_PATTERNS.NAME.test(name),
  password: (password: string): boolean => VALIDATION_PATTERNS.PASSWORD.test(password),
};

// CSRF token generation (for forms)
export const generateCSRFToken = (): string => {
  return crypto.getRandomValues(new Uint32Array(4)).join('-');
};

// Environment validation
export const validateEnvironment = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check if we can access environment variables
  let hasSupabaseUrl = false;
  let hasSupabaseKey = false;
  
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    hasSupabaseUrl = !!import.meta.env.VITE_SUPABASE_URL;
    hasSupabaseKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Validate Supabase URL format if present
    if (hasSupabaseUrl && !import.meta.env.VITE_SUPABASE_URL.startsWith('https://')) {
      errors.push('VITE_SUPABASE_URL must use HTTPS');
    }
  } else {
    // Fallback - assume we have the hardcoded values
    hasSupabaseUrl = true;
    hasSupabaseKey = true;
  }
  
  if (!hasSupabaseUrl) {
    errors.push('VITE_SUPABASE_URL is required');
  }
  
  if (!hasSupabaseKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};
